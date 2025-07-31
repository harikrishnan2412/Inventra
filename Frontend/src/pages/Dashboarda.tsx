// src/pages/Dashboarda.tsx

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { Trash2, PlusCircle } from "lucide-react";

const API_URL = "http://localhost:5000/api/users";

// --- FIX 1: Define an interface for the component's props ---
interface DashboardaProps {
  userRole: string;
}

// --- FIX 2: Update the component to accept the props ---
const Dashboarda = ({ userRole }: DashboardaProps) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "manager"
  });
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(API_URL);
      if (Array.isArray(res.data.users)) {
        setUsers(res.data.users);
      } else {
        console.error("API response did not contain a users array:", res.data);
        setUsers([]);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleCreate = async () => {
    const { name, email, password, role } = form;
    if (!name || !email || !password) return;

    try {
      await axios.post(API_URL, { name, email, password, role });
      setForm({ name: "", email: "", password: "", role: "manager" });
      fetchUsers();
    } catch (err) {
      console.error("Failed to create user:", err);
    }
  };

  const handleRevoke = async (email: string) => {
    try {
      await axios.delete(`${API_URL}/${encodeURIComponent(email)}`);
      fetchUsers();
    } catch (err) {
      console.error("Failed to revoke user:", err);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          {/* You can optionally display the role for confirmation */}
          <p className="text-muted-foreground">Manage team roles and access (Role: {userRole})</p>
        </div>
      </div>

      <Card className="animate-slide-up shadow-elegant">
        <CardHeader>
          <CardTitle>Create new employee account</CardTitle>
          <CardDescription>
            Fill in the details to add a new team member
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            placeholder="Name"
            value={form.name}
            onChange={e => handleChange("name", e.target.value)}
          />
          <Input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={e => handleChange("email", e.target.value)}
          />
          <Input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={e => handleChange("password", e.target.value)}
          />
          <Select
            value={form.role}
            onValueChange={val => handleChange("role", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
          </Select>
          <Button
            className="col-span-full md:col-span-2 lg:col-span-1"
            onClick={handleCreate}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </CardContent>
      </Card>

      <Card className="animate-slide-up shadow-elegant">
        <CardHeader>
          <CardTitle>Existing accounts</CardTitle>
          <CardDescription>Revoke access if needed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {users && users.length > 0 ? (
            users.map((user: { email: string; name: string; role: string }) => (
              <div
                key={user.email}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {user.email} — {user.role}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRevoke(user.email)}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Revoke
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No manager or staff accounts found.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboarda;