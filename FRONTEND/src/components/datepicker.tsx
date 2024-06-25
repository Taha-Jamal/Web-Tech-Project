import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePickerDemo() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [weekStart, setWeekStart] = useState<Date | null>(null);
  const [hours, setHours] = useState<number>(0);

  const accesstoken = localStorage.getItem("accesstoken");
  if (!accesstoken) {
    throw new Error("No token found");
  }
  const refreshtoken = localStorage.getItem("refreshtoken");
  if (!refreshtoken) {
    throw new Error("No token found");
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/api/weekly-hours/date",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accesstoken}`,
            },
            body: JSON.stringify({
              selectedDate: date ? date.toISOString() : null,
            }),
          }
        );
        if (response.status == 401) {
          // throw new Error("Network response was not ok");
          const response = await fetch("http://localhost:5001/api/auth/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token: refreshtoken,
            }),
          });
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const newtoken = await response.json();
          localStorage.removeItem("accesstoken");
          localStorage.removeItem("refreshtoken");
          localStorage.setItem("accesstoken", newtoken.accessToken);
          localStorage.setItem("refreshtoken", newtoken.refreshToken);
          console.log("new accesstoken", accesstoken);
          console.log("new reftoken", refreshtoken);
          window.location.href = "/Dashboard";
        }
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const responseData = await response.json();
        // if(response.status == 401){
        //   const response = await fetch(
        //     "http://localhost:5001/api/auth/token",
        //     {
        //       method: "POST",
        //       headers: {
        //         "Content-Type": "application/json",

        //       },
        //       body: JSON.stringify({
        //         token: refreshtoken,
        //       }),
        //     }
        //   );
        //   if (!response.ok) {
        //     throw new Error("Network response was not ok");
        //   }
        //   const newtoken = await response.json();
        //   localStorage.setItem('accesstoken',newtoken.accessToken)
        // localStorage.setItem('refreshtoken',newtoken.refreshToken)
        // console.log("new token",accesstoken)
        // console.log("new token",refreshtoken)

        // }
        setWeekStart(new Date(responseData.weekStart));
        setHours(responseData.hours);
      } catch (error) {
        console.error("Failed to fetch:", error);
      }
    };

    if (date) {
      fetchData();
    }
  }, [date, accesstoken, refreshtoken]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <p>Week Start Date: {weekStart ? formatDate(weekStart) : "Loading..."}</p>
      <p>Hours: {hours.toFixed(2)}</p>
      <p>Time in Percentage(40 hours): {((hours / 40) * 100).toFixed(2)}</p>
    </>
  );
}

const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};
