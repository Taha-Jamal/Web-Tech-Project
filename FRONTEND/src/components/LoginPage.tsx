import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type FormData = z.infer<typeof schema>;

export const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData, e: any) => {
    e.preventDefault();
    console.log("submit data", data);

    try {
      const response = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data?.email,
          password: data?.password,
        }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const responseData = await response.json();
      console.log(responseData);
      console.log(responseData.accessToken);
      console.log(responseData.refreshToken);
      
      localStorage.setItem('accesstoken',responseData.accessToken)
      localStorage.setItem('refreshtoken',responseData.refreshToken)
      alert('Login successful');
      window.location.href = "/Dashboard";
    


    } catch (error) {
      console.log("An error occurred:", error);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <p className="font-bold text-3xl">Login</p>
        <div className="flex flex-col">
          <label className="font-bold text-2xl" htmlFor="email">
            Email
          </label>
          <input
            className="border-2 w-56 rounded-md"
            type="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500">{errors.email.message as string}</p>
          )}
        </div>
        <div className="flex flex-col">
          <label className="font-bold text-2xl" htmlFor="password">
            Password
          </label>
          <input
            className="border-2 w-56 rounded-md"
            type="password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-500">{errors.password.message as string}</p>
          )}
        </div>
        <div className="flex justify-center items-center border-2 w-56 bg-blue-500 rounded-md text-white">
          <button type="submit">Submit</button>
        </div>
      </form>
      <div>
        <Link to="/Signup">
          Dont have an Account?{" "}
          <span className="text-blue-600 font-semibold">Signup</span>{" "}
        </Link>
      </div>
    </div>
  );
};
