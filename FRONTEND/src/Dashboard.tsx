const Dashboard = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No token found");
  }
  console.log(token);
  return (
    <>
      <div className="bg-red w-56 h-56">Dashboard</div>
    </>
  );
};

export default Dashboard;
