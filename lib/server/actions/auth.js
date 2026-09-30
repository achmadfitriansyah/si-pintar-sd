import bcrypt from "bcryptjs";
import { db, run, AppError } from "../db";

const SCHOOL_FIELDS = "id,slug,name,short_name,logo_url,is_demo,max_books,loan_days,rombel";
const MAX_FAIL = 5;
const WINDOW_MS = 5 * 60 * 1000;

export async function schoolBySlug(slug) {
  const s = await run(db().from("schools").select(SCHOOL_FIELDS).eq("slug", String(slug || "").toLowerCase()).maybeSingle());
  if (!s) throw new AppError("Sekolah tidak ditemukan", 404);
  return s;
}

export async function schoolById(id) {
  const s = await run(db().from("schools").select(SCHOOL_FIELDS).eq("id", id).maybeSingle());
  if (!s) throw new AppError("Sekolah tidak ditemukan", 404);
  return s;
}

/** Cek username/password admin sekolah. Password NULL di database = bawaan "admin". */
export async function verifyAdmin(schoolId, username, password) {
  const admin = await run(
    db().from("admins").select("id,username,password_hash,must_change").eq("school_id", schoolId).eq("username", String(username || "").trim().toLowerCase()).maybeSingle()
  );
  if (!admin) return null;
  const ok = admin.password_hash ? bcrypt.compareSync(String(password || ""), admin.password_hash) : password === "admin";
  return ok ? admin : null;
}

async function tooManyAttempts(key) {
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { count } = await db().from("login_attempts").select("id", { count: "exact", head: true }).eq("key", key).gte("created_at", since);
  return (count || 0) >= MAX_FAIL;
}

export const authActions = {
  "school.info": {
    fn: async ({ payload }) => schoolBySlug(payload.slug),
  },

  "auth.login": {
    fn: async ({ payload, res }) => {
      const { slug, role, username, password } = payload;
      if (!["siswa", "ortu", "guru"].includes(role)) throw new AppError("Peran tidak dikenal");
      const school = await schoolBySlug(slug);
      const id = String(username || "").trim();
      if (!id || !password) throw new AppError(role === "guru" ? "Isi username dan password" : "Isi NISN dan password");
      const key = `${school.id}:${role}:${id.toLowerCase()}`;
      if (await tooManyAttempts(key)) throw new AppError("Terlalu banyak percobaan salah. Coba lagi 5 menit lagi.", 429);

      let session = null;
      let mustChange = false;
      if (role === "guru") {
        const admin = await verifyAdmin(school.id, id, password);
        if (admin) {
          session = { role, schoolId: school.id, slug: school.slug, adminId: admin.id };
          mustChange = admin.must_change;
        }
      } else {
        const st = await run(db().from("students").select("id,status,pin_hash,ortu_pin_hash").eq("school_id", school.id).eq("nisn", id).maybeSingle());
        if (st && st.status === "alumni") throw new AppError("Akun ini sudah alumni.");
        // siswa dan orang tua punya password sendiri-sendiri; kosong = password awal 123456
        const hash = st && (role === "ortu" ? st.ortu_pin_hash : st.pin_hash);
        const ok = st && (hash ? bcrypt.compareSync(String(password), hash) : password === "123456");
        if (ok) session = { role, schoolId: school.id, slug: school.slug, studentId: st.id };
      }

      if (!session) {
        await db().from("login_attempts").insert({ key });
        throw new AppError(role === "guru" ? "Username atau password salah" : "NISN atau password salah", 401);
      }
      await db().from("login_attempts").delete().eq("key", key);
      res.setSession = session;
      return { role, mustChange };
    },
  },

  "auth.logout": {
    fn: async ({ res }) => {
      res.clearSession = true;
      return { ok: true };
    },
  },

  "auth.me": {
    fn: async ({ session, res }) => {
      if (!session) return null;
      const school = await schoolById(session.schoolId).catch(() => null);
      if (!school) {
        res.clearSession = true;
        return null;
      }
      if (session.role === "guru") {
        const admin = await run(db().from("admins").select("id,username,must_change").eq("id", session.adminId).maybeSingle());
        if (!admin) {
          res.clearSession = true;
          return null;
        }
        return { role: "guru", school, admin };
      }
      const student = await run(db().from("students").select("id,nisn,nama,kelas,status").eq("id", session.studentId).maybeSingle());
      if (!student || student.status !== "aktif") {
        res.clearSession = true;
        return null;
      }
      return { role: session.role, school, student };
    },
  },

  "auth.changePassword": {
    roles: ["guru"],
    fn: async ({ payload, session }) => {
      const school = await schoolById(session.schoolId);
      if (school.is_demo) throw new AppError("Ganti password tidak tersedia di mode demo.");
      const admin = await run(db().from("admins").select("id,username").eq("id", session.adminId).single());
      const ok = await verifyAdmin(session.schoolId, admin.username, payload.oldPassword);
      if (!ok) throw new AppError("Password lama salah");
      const np = String(payload.newPassword || "");
      if (np.length < 6) throw new AppError("Password baru minimal 6 karakter");
      if (np === "admin") throw new AppError("Password baru tidak boleh 'admin'");
      await run(db().from("admins").update({ password_hash: bcrypt.hashSync(np, 10), must_change: false }).eq("id", admin.id));
      return { ok: true };
    },
  },

  // Siswa mengganti password miliknya, orang tua mengganti password miliknya (terpisah)
  "auth.changePin": {
    roles: ["siswa", "ortu"],
    fn: async ({ payload, session }) => {
      const school = await schoolById(session.schoolId);
      if (school.is_demo) throw new AppError("Ganti password tidak tersedia di mode demo.");
      const col = session.role === "ortu" ? "ortu_pin_hash" : "pin_hash";
      const st = await run(db().from("students").select(`id,${col}`).eq("id", session.studentId).single());
      const cur = st[col];
      const okOld = cur ? bcrypt.compareSync(String(payload.oldPassword || ""), cur) : String(payload.oldPassword || "") === "123456";
      if (!okOld) throw new AppError("Password lama salah");
      const np = String(payload.newPassword || "");
      if (np.length < 6) throw new AppError("Password baru minimal 6 karakter");
      if (np === "123456") throw new AppError("Pilih password yang berbeda dari password awal");
      await run(db().from("students").update({ [col]: bcrypt.hashSync(np, 10) }).eq("id", st.id));
      return { ok: true };
    },
  },
};
