import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/naigation";
import apiCalls from "./api/api"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useForm } from "react-hook-form";

interface TimeEntry {
  id: string;
  startDateTime: string;
  endDateTime: string;
  description?: string;
}

export default function TimeTracker() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [token, setToken] = useState<string>('');
  const { register, handleSubmit, reset } = useForm<TimeEntry>();

  useEffect(() => {
    const fetchData = async ()=>{   
        const tokenlocal = window.localStorage.getItem("token");
        if (tokenlocal) {
          setToken(tokenlocal)
          
          const data = await apiCalls.getUserEntries(tokenlocal);
          const test = data.entries.map(item => {
            const transformed = {...item};

            if (item.starttime) {
              transformed.starttime = item.starttime.toString().length === 10 
                ? item.starttime * 1000 
                : item.starttime;
            }
            
            if (item.endtime) {
              transformed.endtime = item.endtime.toString().length === 10 
                ? item.endtime * 1000 
                : item.endtime;
            }
            
            return transformed;
          })
          setEntries(data.entries);
        } else window.location.href = "/Login";
    }
    fetchData()
  }, []);

  const onSubmit = async (data: TimeEntry) => {
    const response = await apiCalls.postUserEntry(data, token)
    if(entries.length>0)setEntries([...entries,{...data}]);
    else setEntries([{ ...data, id:String(Date.now())}]);
    console.log(entries)
    reset();
    
  };

  return (
    <>
      <Navigation/>
      <div className="p-8 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                {...register("startDateTime", { required: true })}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                {...register("endDateTime", { required: true })}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description (optional)
            </label>
            <Input {...register("description")} />
          </div>

          <Button type="submit">Add Entry</Button>
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length > 0 ? (
              entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {new Date(entry.startDateTime).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(entry.endDateTime).toLocaleString()}
                  </TableCell>
                  <TableCell>{entry.description || "-"}</TableCell>
                </TableRow>
              ))
            ) : (
              <></>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
