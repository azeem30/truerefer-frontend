"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Linkedin, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function EditProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const profilePictureRef = useRef<HTMLInputElement>(null);
  const resumeRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState({
    id: "",
    profilePicture: "/placeholder.svg?height=150&width=150",
    resume: null as File | null,
    firstName: "",
    middleName: "",
    lastName: "",
    college: "",
    company: "",
    role: "",
    experience: "",
    location: "",
    linkedinProfile: "",
    degree: "",
    startYear: "",
    endYear: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadClick = (ref: React.RefObject<HTMLInputElement | null>) => {
      ref.current?.click();
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setProfile(prev => ({
          ...prev,
          profilePicture: event.target?.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !['pdf', 'doc', 'docx'].includes(fileExtension || '')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return;
    }

    setProfile(prev => ({
      ...prev,
      resume: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      const user = JSON.parse(localStorage.getItem("user") || "{}");
    
      // Add all text fields
      formData.append("id", user.id || "");
      formData.append("firstName", profile.firstName);
      formData.append("middleName", profile.middleName || "");
      formData.append("lastName", profile.lastName);
      formData.append("college", profile.college);
      formData.append("company", profile.company || "");
      formData.append("role", profile.role || "");
      formData.append("experience", profile.experience || "0");
      formData.append("location", profile.location);
      formData.append("linkedinProfile", profile.linkedinProfile || "");
      formData.append("degree", profile.degree || "");
      formData.append("startYear", profile.startYear || "");
      formData.append("endYear", profile.endYear || "");

      // Add profile picture if changed
      if (profilePictureRef.current?.files?.[0]) {
        formData.append("profilePicture", profilePictureRef.current.files[0]);
      }

      // Add resume file if selected
      if (profile.resume) {
        formData.append("resume", profile.resume);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/edit_profile`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: "default",
      });
      router.push("/profile");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={profile.profilePicture} alt="Profile picture" />
                  <AvatarFallback>
                    {profile.firstName.charAt(0)}
                    {profile.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Input
                  type="file"
                  id="profilePicture"
                  ref={profilePictureRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                />
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => handleUploadClick(profilePictureRef)}
                >
                  <Upload className="mr-2 h-4 w-4" /> 
                  Upload Profile Picture
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input id="middleName" name="middleName" value={profile.middleName} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" value={profile.lastName} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="college">College</Label>
                  <Input id="college" name="college" value={profile.college} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="degree">Degree</Label>
                  <Input id="degree" name="degree" value={profile.degree} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startYear">Start Year</Label>
                  <Input
                    id="startYear"
                    name="startYear"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={profile.startYear}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endYear">End Year</Label>
                  <Input
                    id="endYear"
                    name="endYear"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 5}
                    value={profile.endYear}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" name="company" value={profile.company} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" name="role" value={profile.role} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience (years)</Label>
                  <Input
                    id="experience"
                    name="experience"
                    type="number"
                    min="0"
                    max="50"
                    value={profile.experience}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" value={profile.location} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                      <Linkedin className="h-4 w-4" />
                    </span>
                    <Input
                      id="linkedinProfile"
                      name="linkedinProfile"
                      value={profile.linkedinProfile}
                      onChange={handleInputChange}
                      className="rounded-l-none"
                      placeholder="username"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resume">Resume</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    id="resume"
                    ref={resumeRef}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => handleUploadClick(resumeRef)}
                  >
                    <Upload className="mr-2 h-4 w-4" /> 
                    Upload Resume
                  </Button>
                  {profile.resume && (
                    <span className="text-sm text-muted-foreground">
                      {profile.resume.name}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  PDF or Word documents only, max 10MB
                </p>
              </div>

              <div className="flex justify-end gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()} 
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}