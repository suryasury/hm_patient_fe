"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import isMobilePhone from "validator/es/lib/isMobilePhone";

const FormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  mobile: z.string().refine(isMobilePhone),
  email: z.string(),
});

function PatientDetails() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-2/3  grid grid-cols-2"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile Number</FormLabel>
              <FormControl>
                <Input placeholder="+919292929292" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="+919292929292" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-[18px]">
          <FormLabel>Gender</FormLabel>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Select an option</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuCheckboxItem
              //   checked={showStatusBar}
              //   onCheckedChange={setShowStatusBar}
              >
                Male
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
              //   checked={showActivityBar}
              //   onCheckedChange={setShowActivityBar}
              >
                Female
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
              //   checked={showPanel}
              //   onCheckedChange={setShowPanel}
              >
                Others
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  );
}

export default PatientDetails;
