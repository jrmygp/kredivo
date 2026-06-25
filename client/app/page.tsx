"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { mapDispatchToProps, mapStateToProps } from "@/redux";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { useEffect } from "react";
import { connect } from "react-redux";
import * as yup from "yup";

type LoginPageProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const LoginPage = ({ handleSetUser, user }: LoginPageProps) => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const loginMutation = useLogin();

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: yup.object({
      username: yup.string().required("Username wajib diisi"),
      password: yup.string().required("Password wajib diisi"),
    }),
    onSubmit: (values) => {
      loginMutation.mutate(values, {
        onSuccess: (data) => {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user_id", data.user_id);
          handleSetUser(data);
          enqueueSnackbar("Login berhasil. Selamat datang kembali.", {
            variant: "success",
          });
        },
      });
    },
  });

  useEffect(() => {
    if (user && user?.user_id) {
      router.push("/dashboard");
    }
  }, [router, user]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-200/80 md:grid-cols-[1fr_1.1fr]">
        <div className="hidden bg-slate-950 p-10 text-white md:flex md:flex-col md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Workspace</p>
            <h1 className="mt-6 max-w-sm text-4xl font-bold leading-tight">
              Fokus pada hal penting, lanjutkan dari tempat terakhir.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
              Masuk untuk membuka ruang kerja, melihat prioritas, dan menyelesaikan pekerjaan dengan lebih tenang.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-medium text-slate-200">
              Satu tempat untuk menjaga alur kerja tetap jelas, rapi, dan mudah ditindaklanjuti.
            </p>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-12">
          <div className="mx-auto w-full max-w-md">
            <div className="md:hidden">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Workspace</p>
              <h1 className="mt-4 text-3xl font-bold leading-tight">Saatnya lanjut bekerja</h1>
            </div>

            <div className="hidden md:block">
              <h2 className="text-3xl font-bold">Selamat datang kembali</h2>
              <p className="mt-2 text-sm text-slate-500">
                Masuk untuk melanjutkan pekerjaanmu dengan lebih terarah.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={formik.handleSubmit}>
              <Input
                id="username"
                label="Username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Masukkan username"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.username}
                error={formik.touched.username ? formik.errors.username : undefined}
              />

              <Input
                id="password"
                label="Password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Masukkan password"
                rightElement={
                  <a href="#" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
                    Lupa password?
                  </a>
                }
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                error={formik.touched.password ? formik.errors.password : undefined}
              />

              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Ingat saya
                </label>
              </div>

              {loginMutation.isError ? (
                <p className="text-sm text-red-600">
                  Belum berhasil masuk. Periksa kembali username dan password kamu.
                </p>
              ) : null}

              {loginMutation.isSuccess ? (
                <p className="text-sm text-emerald-700">Berhasil masuk. Kamu akan diarahkan sebentar lagi.</p>
              ) : null}

              <Button type="submit" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Memproses..." : "Masuk"}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Belum punya akun?{" "}
              <a href="#" className="font-semibold text-emerald-700 hover:text-emerald-800">
                Hubungi admin
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
