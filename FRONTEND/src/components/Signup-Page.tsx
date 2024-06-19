import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";

// Define your schema using Zod
const schema = z.object({
  username: z
    .string()
    .min(2, { message: "Username must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type FormData = z.infer<typeof schema>;

export const Signup = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData, e: any) => {
    e.preventDefault();
    console.log("submit data", data);

    try {
      const response = await fetch("http://localhost:5001/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data?.username,
          email: data?.email,
          password: data?.password,
        }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const responseData = await response.json();

      console.log(responseData);
    } catch (error) {
      console.log("An error occurred:", error);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <p className="font-bold text-3xl">SignUp</p>
        <div className="flex flex-col">
          <label className="font-bold text-2xl" htmlFor="username">
            Username
          </label>
          <input
            className="border-2 w-56 rounded-md"
            type="text"
            {...register("username")}
          />
          {errors.username && (
            <p className="text-red-500">{errors.username.message as string}</p>
          )}
        </div>
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
        <Link to="/">
          Already Signup?{" "}
          <span className="text-blue-600 font-semibold">Login</span>{" "}
        </Link>
      </div>
    </div>
  );
};
