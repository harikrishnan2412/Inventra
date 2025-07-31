import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Trash2, PlusCircle } from "lucide-react";

const Dashboarda = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "manager"
  });

  const [users, setUsers] = useState([
    { name: "Ravi Kumar", email: "ravi@example.com", role: "manager" },
    { name: "Sneha Reddy", email: "sneha@example.com", role: "staff" }
  ]);

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleCreate = () => {
    if (form.name && form.email && form.password && form.role) {
      setUsers(prev => [...prev, { name: form.name, email: form.email, role: form.role }]);
      setForm({ name: "", email: "", password: "", role: "manager" });
    }
  };

  const handleRevoke = (email: string) => {
    setUsers(prev => prev.filter(user => user.email !== email));
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage team roles and access</p>
        </div>
      </div>

      {/* Create User */}
      <Card className="animate-slide-up shadow-elegant">
        <CardHeader>
          <CardTitle>Create Manager/Staff</CardTitle>
          <CardDescription>Fill in the details to add a new team member</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input placeholder="Name" value={form.name} onChange={e => handleChange("name", e.target.value)} />
          <Input placeholder="Email" value={form.email} onChange={e => handleChange("email", e.target.value)} />
          <Input placeholder="Password" type="password" value={form.password} onChange={e => handleChange("password", e.target.value)} />
          <Select value={form.role} onValueChange={val => handleChange("role", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
          </Select>
          <Button className="col-span-full md:col-span-2 lg:col-span-1" onClick={handleCreate}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </CardContent>
      </Card>

      {/* Revoke Access */}
      <Card className="animate-slide-up shadow-elegant">
        <CardHeader>
          <CardTitle>Existing Team Members</CardTitle>
          <CardDescription>Revoke access if needed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {users.map(user => (
            <div key={user.email} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email} — {user.role}</p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => handleRevoke(user.email)}>
                <Trash2 className="w-4 h-4 mr-1" /> Revoke
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboarda;
