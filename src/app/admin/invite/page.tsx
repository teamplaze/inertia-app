"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, ShieldAlert } from "lucide-react";
// Using relative import to ensure build stability
import { createClient } from "../../../lib/supabase/client";

type Project = {
  id: number;
  project_title: string;
  artist_name: string; // Added artist_name to type
};

export default function AdminInvitePage() {
  const [email, setEmail] = useState("");
  const [projectId, setProjectId] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  useEffect(() => {
    const fetchProjects = async () => {
      // Fetch all projects. We don't filter for orphans anymore because
      // multiple people can now be invited to the same project.
      const { data, error } = await supabase
        .from('projects')
        .select('id, project_title, artist_name') // Fetch artist_name as well
        .order('created_at', { ascending: false });
      
      if (data) setProjects(data);
      if (error) console.error("Error fetching projects:", error);
    };
    fetchProjects();
  }, [supabase]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setCopied(false);
    setInviteLink("");

    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email, 
            projectId: projectId ? parseInt(projectId) : null 
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate invite");
      }

      setInviteLink(data.link);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto py-20 px-4 flex justify-center min-h-[60vh] items-center">
      <Card className="w-full max-w-md bg-[#2D3534] border-[#CB945E] text-white">
        <CardHeader>
          <div className="flex items-center gap-2 text-[#CB945E] mb-2">
            <ShieldAlert className="w-5 h-5" />
            <span className="text-xs font-mono uppercase tracking-widest">Internal Tool</span>
          </div>
          <CardTitle className="text-2xl text-white">Generate Artist Invite</CardTitle>
          <CardDescription className="text-gray-400">
            Create a secure, one-time signup link for a new artist and link them to a project team.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">Artist Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="artist@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/20 border-gray-600 text-white focus-visible:ring-[#CB945E]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project" className="text-gray-200">Link to Project (Optional)</Label>
              <Select onValueChange={setProjectId} value={projectId}>
                <SelectTrigger className="bg-black/20 border-gray-600 text-white w-full">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent className="bg-[#2D3534] text-white border-gray-600">
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.artist_name} - {p.project_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400">
                The user will be added as a member of this project.
              </p>
            </div>
            
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <Button 
              type="submit" 
              className="w-full bg-[#CB945E] hover:bg-[#CB945E]/90 text-white font-medium"
              disabled={loading}
            >
              {loading ? "Generating Token..." : "Generate Invite Link"}
            </Button>
          </form>

          {inviteLink && (
            <div className="pt-4 border-t border-gray-700 animate-in fade-in slide-in-from-top-2">
              <Label className="text-xs text-gray-400 mb-2 block uppercase tracking-wide">
                Invitation Link (Valid for 7 Days)
              </Label>
              <div className="flex items-center gap-2 bg-black/40 p-1 rounded-md border border-gray-700">
                <Input 
                  value={inviteLink} 
                  readOnly 
                  className="bg-transparent border-none text-sm text-[#CB945E] h-auto py-2 focus-visible:ring-0"
                />
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={copyToClipboard}
                  className="h-8 w-8 text-gray-400 hover:text-white shrink-0 mr-1"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Share this link with the artist. They will generally be added to the project upon signup.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}