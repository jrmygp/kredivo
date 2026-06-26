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
      <section className="grid w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-200/80">
        <div className="px-6 py-8 sm:px-10 sm:py-12">
          <div className="mx-auto w-full max-w-md">
            <div className="md:hidden">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Workspace</p>
              <h1 className="mt-4 text-3xl font-bold leading-tight">Saatnya lanjut bekerja</h1>
            </div>

            <div className="hidden md:block">
              <h2 className="text-3xl font-bold">Welcome back</h2>
              <p className="mt-2 text-sm text-slate-500">Log in to manage your tasks</p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={formik.handleSubmit}>
              <Input
                id="username"
                label="Username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Input username"
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
                placeholder="Input password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                error={formik.touched.password ? formik.errors.password : undefined}
              />

              {loginMutation.isError ? (
                <p className="text-sm text-red-600">Somewthing went wrong, Please try again.</p>
              ) : null}

              {loginMutation.isSuccess ? (
                <p className="text-sm text-emerald-700">Berhasil masuk. Kamu akan diarahkan sebentar lagi.</p>
              ) : null}

              <Button type="submit" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Loading..." : "Log In"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
