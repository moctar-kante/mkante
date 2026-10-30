import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { loadConfig } from "@caffeineai/core-infrastructure";
import { ExternalBlob, StorageClient } from "@caffeineai/object-storage";
import { HttpAgent } from "@icp-sdk/core/agent";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSessionTimeout } from "../hooks/useSessionTimeout";
import type {
  Education,
  Experience,
  Language,
  ObjectiveWithStatus,
  OngoingProject,
  OngoingProjectInput,
  Profile,
  Publication,
  RelevantLink,
  RelevantLinkInput,
  SocialLink,
} from "../types";
import { ObjectiveStatus } from "../types";

type Tab =
  | "profile"
  | "experience"
  | "education"
  | "publications"
  | "languages"
  | "social"
  | "projects"
  | "relevant-links"
  | "settings";

function emptyLocalized() {
  return { en: "", fr: "", es: "" };
}

function LocalizedInput({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: { en: string; fr: string; es: string };
  onChange: (v: { en: string; fr: string; es: string }) => void;
  multiline?: boolean;
}) {
  const langs: Array<"en" | "fr" | "es"> = ["en", "fr", "es"];
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      {langs.map((l) => (
        <div key={l} className="flex items-start gap-2">
          <span className="text-xs text-muted-foreground w-6 pt-2 flex-shrink-0 uppercase">
            {l}
          </span>
          {multiline ? (
            <Textarea
              value={value[l]}
              onChange={(e) => onChange({ ...value, [l]: e.target.value })}
              rows={3}
              className="text-sm"
            />
          ) : (
            <Input
              value={value[l]}
              onChange={(e) => onChange({ ...value, [l]: e.target.value })}
              className="text-sm"
            />
          )}
        </div>
      ))}
    </div>
  );
}

function ProfileTab() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery<Profile | null>({
    queryKey: ["profile"],
    queryFn: () => (actor ? actor.getProfile() : Promise.resolve(null)),
    enabled: !!actor,
  });

  const [form, setForm] = useState<Profile>({
    fullName: "",
    title: "",
    headline: emptyLocalized(),
    bio: emptyLocalized(),
    bioShort: emptyLocalized(),
    avatarUrl: "",
    email: "",
    location: "",
    orcidId: "",
    orcidUrl: "",
    linkedinUrl: undefined,
    githubUrl: undefined,
    cvDownloadUrl: undefined,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setForm({ ...profile });
  }, [profile]);

  async function handleSave() {
    setSaving(true);
    try {
      await actor!.updateProfile(form);
      qc.invalidateQueries({ queryKey: ["profile"], refetchType: "all" });
      toast.success("Profile saved");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading)
    return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-5 max-w-xl" data-ocid="admin.panel">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs">Full Name</Label>
          <Input
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="text-sm"
            data-ocid="admin.input"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Title</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="text-sm"
            data-ocid="admin.input"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs">Email</Label>
          <Input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="text-sm"
            data-ocid="admin.input"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Location</Label>
          <Input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="text-sm"
            data-ocid="admin.input"
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Avatar URL</Label>
        <Input
          value={form.avatarUrl}
          onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
          className="text-sm"
          data-ocid="admin.input"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs">ORCID ID</Label>
          <Input
            value={form.orcidId}
            onChange={(e) => setForm({ ...form, orcidId: e.target.value })}
            className="text-sm"
            data-ocid="admin.input"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">ORCID URL</Label>
          <Input
            value={form.orcidUrl}
            onChange={(e) => setForm({ ...form, orcidUrl: e.target.value })}
            className="text-sm"
            data-ocid="admin.input"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs">LinkedIn URL</Label>
          <Input
            value={form.linkedinUrl ?? ""}
            onChange={(e) =>
              setForm({ ...form, linkedinUrl: e.target.value || undefined })
            }
            className="text-sm"
            data-ocid="admin.input"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">GitHub URL</Label>
          <Input
            value={form.githubUrl ?? ""}
            onChange={(e) =>
              setForm({ ...form, githubUrl: e.target.value || undefined })
            }
            className="text-sm"
            data-ocid="admin.input"
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">CV Download URL</Label>
        <Input
          value={form.cvDownloadUrl ?? ""}
          onChange={(e) =>
            setForm({ ...form, cvDownloadUrl: e.target.value || undefined })
          }
          className="text-sm"
          data-ocid="admin.input"
        />
      </div>
      <LocalizedInput
        label="Headline"
        value={form.headline}
        onChange={(v) => setForm({ ...form, headline: v })}
      />
      <LocalizedInput
        label="Bio (short, max 300 chars)"
        value={form.bioShort}
        onChange={(v) => setForm({ ...form, bioShort: v })}
      />
      <LocalizedInput
        label="Bio (full, markdown)"
        value={form.bio}
        onChange={(v) => setForm({ ...form, bio: v })}
        multiline
      />
      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-primary text-primary-foreground hover:opacity-90"
        data-ocid="admin.save_button"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Save Profile
      </Button>
    </div>
  );
}

function emptyExperience(): Experience {
  return {
    id: 0n,
    title: emptyLocalized(),
    organization: "",
    location: "",
    startDate: "",
    endDate: undefined,
    description: emptyLocalized(),
    tags: [],
    displayOrder: 0n,
  };
}

function ExperienceTab() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const { data: items, isLoading } = useQuery<Experience[]>({
    queryKey: ["experiences"],
    queryFn: () => (actor ? actor.getAllExperiences() : Promise.resolve([])),
    enabled: !!actor,
  });

  const [editItem, setEditItem] = useState<Experience | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tagsStr, setTagsStr] = useState("");

  function startAdd() {
    setEditItem(emptyExperience());
    setIsNew(true);
    setTagsStr("");
  }

  function startEdit(item: Experience) {
    setEditItem({ ...item });
    setIsNew(false);
    setTagsStr(item.tags.join(", "));
  }

  async function handleSave() {
    if (!editItem) return;
    setSaving(true);
    try {
      const data = {
        ...editItem,
        tags: tagsStr
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      if (isNew) {
        await actor!.createExperience(data);
        toast.success("Experience added");
      } else {
        await actor!.updateExperience(editItem.id, data);
        toast.success("Experience updated");
      }
      qc.invalidateQueries({ queryKey: ["experiences"], refetchType: "all" });
      setEditItem(null);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: bigint) {
    if (!window.confirm("Delete this experience?")) return;
    try {
      await actor!.deleteExperience(id);
      qc.invalidateQueries({ queryKey: ["experiences"], refetchType: "all" });
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function handleReorder(list: Experience[], idx: number, dir: -1 | 1) {
    const newItems = [...list];
    const target = idx + dir;
    if (target < 0 || target >= newItems.length) return;
    [newItems[idx], newItems[target]] = [newItems[target], newItems[idx]];
    const order: Array<[bigint, bigint]> = newItems.map((item, i) => [
      item.id,
      BigInt(i),
    ]);
    try {
      await actor!.updateExperienceOrder(order);
      qc.invalidateQueries({ queryKey: ["experiences"], refetchType: "all" });
    } catch {
      toast.error("Failed to reorder");
    }
  }

  if (isLoading)
    return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (editItem) {
    return (
      <div className="space-y-4 max-w-xl" data-ocid="admin.panel">
        <h3 className="font-medium">
          {isNew ? "Add Experience" : "Edit Experience"}
        </h3>
        <LocalizedInput
          label="Title"
          value={editItem.title}
          onChange={(v) => setEditItem({ ...editItem, title: v })}
        />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Organization</Label>
            <Input
              value={editItem.organization}
              onChange={(e) =>
                setEditItem({ ...editItem, organization: e.target.value })
              }
              className="text-sm"
              data-ocid="admin.input"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Location</Label>
            <Input
              value={editItem.location}
              onChange={(e) =>
                setEditItem({ ...editItem, location: e.target.value })
              }
              className="text-sm"
              data-ocid="admin.input"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Start Date (Year &amp; Month)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Year"
                value={
                  editItem.startDate ? editItem.startDate.split("-")[0] : ""
                }
                onChange={(e) => {
                  const yr = e.target.value;
                  const mo = editItem.startDate
                    ? (editItem.startDate.split("-")[1] ?? "01")
                    : "01";
                  setEditItem({
                    ...editItem,
                    startDate: yr ? `${yr}-${mo}` : "",
                  });
                }}
                className="text-sm w-24"
                data-ocid="admin.input"
              />
              <select
                value={
                  editItem.startDate
                    ? (editItem.startDate.split("-")[1] ?? "01")
                    : "01"
                }
                onChange={(e) => {
                  const yr = editItem.startDate
                    ? editItem.startDate.split("-")[0]
                    : new Date().getFullYear().toString();
                  setEditItem({
                    ...editItem,
                    startDate: yr ? `${yr}-${e.target.value}` : "",
                  });
                }}
                className="text-sm border border-input rounded-md px-2 py-1.5 bg-background text-foreground flex-1 h-9"
                data-ocid="admin.select"
              >
                {[
                  "01",
                  "02",
                  "03",
                  "04",
                  "05",
                  "06",
                  "07",
                  "08",
                  "09",
                  "10",
                  "11",
                  "12",
                ].map((m, i) => (
                  <option key={m} value={m}>
                    {
                      [
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ][i]
                    }
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">
              End Date (Year &amp; Month, blank = Present)
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Year"
                value={editItem.endDate ? editItem.endDate.split("-")[0] : ""}
                onChange={(e) => {
                  const yr = e.target.value;
                  const mo = editItem.endDate
                    ? (editItem.endDate.split("-")[1] ?? "01")
                    : "01";
                  setEditItem({
                    ...editItem,
                    endDate: yr ? `${yr}-${mo}` : undefined,
                  });
                }}
                className="text-sm w-24"
                data-ocid="admin.input"
              />
              <select
                value={
                  editItem.endDate
                    ? (editItem.endDate.split("-")[1] ?? "01")
                    : "01"
                }
                onChange={(e) => {
                  const yr = editItem.endDate
                    ? editItem.endDate.split("-")[0]
                    : new Date().getFullYear().toString();
                  setEditItem({
                    ...editItem,
                    endDate: yr ? `${yr}-${e.target.value}` : undefined,
                  });
                }}
                className="text-sm border border-input rounded-md px-2 py-1.5 bg-background text-foreground flex-1 h-9"
                data-ocid="admin.select"
              >
                {[
                  "01",
                  "02",
                  "03",
                  "04",
                  "05",
                  "06",
                  "07",
                  "08",
                  "09",
                  "10",
                  "11",
                  "12",
                ].map((m, i) => (
                  <option key={m} value={m}>
                    {
                      [
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ][i]
                    }
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Tags (comma-separated)</Label>
          <Input
            value={tagsStr}
            onChange={(e) => setTagsStr(e.target.value)}
            className="text-sm"
            data-ocid="admin.input"
          />
        </div>
        <LocalizedInput
          label="Description (markdown)"
          value={editItem.description}
          onChange={(v) => setEditItem({ ...editItem, description: v })}
          multiline
        />
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground hover:opacity-90"
            data-ocid="admin.save_button"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save
          </Button>
          <Button
            variant="outline"
            onClick={() => setEditItem(null)}
            data-ocid="admin.cancel_button"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-ocid="admin.panel">
      <Button
        size="sm"
        onClick={startAdd}
        className="bg-primary text-primary-foreground hover:opacity-90"
        data-ocid="admin.primary_button"
      >
        <Plus className="h-4 w-4 mr-1" /> Add Experience
      </Button>
      {(!items || items.length === 0) && (
        <p className="text-sm text-muted-foreground">No entries.</p>
      )}
      {items?.map((item, i) => (
        <div
          key={String(item.id)}
          className="flex items-center gap-2 border border-border rounded p-3"
          data-ocid={`admin.item.${i + 1}`}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{item.title.en}</p>
            <p className="text-xs text-muted-foreground">
              {item.organization} · {item.startDate}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => handleReorder(items, i, -1)}
              disabled={i === 0}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
              data-ocid={`admin.secondary_button.${i + 1}`}
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleReorder(items, i, 1)}
              disabled={i === items.length - 1}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
              data-ocid={`admin.secondary_button.${i + 1}`}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => startEdit(item)}
              className="p-1 text-muted-foreground hover:text-primary"
              data-ocid={`admin.edit_button.${i + 1}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item.id)}
              className="p-1 text-muted-foreground hover:text-destructive"
              data-ocid={`admin.delete_button.${i + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function emptyEducation(): Education {
  return {
    id: 0n,
    degree: emptyLocalized(),
    field: emptyLocalized(),
    institution: "",
    location: "",
    startYear: 2020n,
    endYear: 2024n,
    thesisHost: undefined,
    notes: emptyLocalized(),
    displayOrder: 0n,
  };
}

function EducationTab() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const { data: items, isLoading } = useQuery<Education[]>({
    queryKey: ["education"],
    queryFn: () => (actor ? actor.getAllEducation() : Promise.resolve([])),
    enabled: !!actor,
  });

  const [editItem, setEditItem] = useState<Education | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  function startAdd() {
    setEditItem(emptyEducation());
    setIsNew(true);
  }
  function startEdit(item: Education) {
    setEditItem({ ...item });
    setIsNew(false);
  }

  async function handleSave() {
    if (!editItem) return;
    setSaving(true);
    try {
      if (isNew) {
        await actor!.createEducation(editItem);
        toast.success("Education added");
      } else {
        await actor!.updateEducation(editItem.id, editItem);
        toast.success("Education updated");
      }
      qc.invalidateQueries({ queryKey: ["education"], refetchType: "all" });
      setEditItem(null);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: bigint) {
    if (!window.confirm("Delete this education entry?")) return;
    try {
      await actor!.deleteEducation(id);
      qc.invalidateQueries({ queryKey: ["education"], refetchType: "all" });
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function handleReorder(list: Education[], idx: number, dir: -1 | 1) {
    const newItems = [...list];
    const target = idx + dir;
    if (target < 0 || target >= newItems.length) return;
    [newItems[idx], newItems[target]] = [newItems[target], newItems[idx]];
    const order: Array<[bigint, bigint]> = newItems.map((item, i) => [
      item.id,
      BigInt(i),
    ]);
    try {
      await actor!.updateEducationOrder(order);
      qc.invalidateQueries({ queryKey: ["education"], refetchType: "all" });
    } catch {
      toast.error("Failed to reorder");
    }
  }

  if (isLoading)
    return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (editItem) {
    return (
      <div className="space-y-4 max-w-xl" data-ocid="admin.panel">
        <h3 className="font-medium">
          {isNew ? "Add Education" : "Edit Education"}
        </h3>
        <LocalizedInput
          label="Degree"
          value={editItem.degree}
          onChange={(v) => setEditItem({ ...editItem, degree: v })}
        />
        <LocalizedInput
          label="Field"
          value={editItem.field}
          onChange={(v) => setEditItem({ ...editItem, field: v })}
        />
        <LocalizedInput
          label="Notes"
          value={editItem.notes}
          onChange={(v) => setEditItem({ ...editItem, notes: v })}
        />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Institution</Label>
            <Input
              value={editItem.institution}
              onChange={(e) =>
                setEditItem({ ...editItem, institution: e.target.value })
              }
              className="text-sm"
              data-ocid="admin.input"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Location</Label>
            <Input
              value={editItem.location}
              onChange={(e) =>
                setEditItem({ ...editItem, location: e.target.value })
              }
              className="text-sm"
              data-ocid="admin.input"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Start Year</Label>
            <Input
              type="number"
              value={Number(editItem.startYear)}
              onChange={(e) =>
                setEditItem({
                  ...editItem,
                  startYear: BigInt(e.target.value || 0),
                })
              }
              className="text-sm"
              data-ocid="admin.input"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">End Year</Label>
            <Input
              type="number"
              value={Number(editItem.endYear)}
              onChange={(e) =>
                setEditItem({
                  ...editItem,
                  endYear: BigInt(e.target.value || 0),
                })
              }
              className="text-sm"
              data-ocid="admin.input"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Thesis Host</Label>
            <Input
              value={editItem.thesisHost ?? ""}
              onChange={(e) =>
                setEditItem({
                  ...editItem,
                  thesisHost: e.target.value || undefined,
                })
              }
              className="text-sm"
              data-ocid="admin.input"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground hover:opacity-90"
            data-ocid="admin.save_button"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Save
          </Button>
          <Button
            variant="outline"
            onClick={() => setEditItem(null)}
            data-ocid="admin.cancel_button"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-ocid="admin.panel">
      <Button
        size="sm"
        onClick={startAdd}
        className="bg-primary text-primary-foreground hover:opacity-90"
        data-ocid="admin.primary_button"
      >
        <Plus className="h-4 w-4 mr-1" /> Add Education
      </Button>
      {(!items || items.length === 0) && (
        <p className="text-sm text-muted-foreground">No entries.</p>
      )}
      {items?.map((item, i) => (
        <div
          key={String(item.id)}
          className="flex items-center gap-2 border border-border rounded p-3"
          data-ocid={`admin.item.${i + 1}`}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{item.degree.en}</p>
            <p className="text-xs text-muted-foreground">
              {item.institution} · {Number(item.endYear)}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleReorder(items, i, -1)}
              disabled={i === 0}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
              data-ocid={`admin.secondary_button.${i + 1}`}
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleReorder(items, i, 1)}
              disabled={i === items.length - 1}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
              data-ocid={`admin.secondary_button.${i + 1}`}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => startEdit(item)}
              className="p-1 text-muted-foreground hover:text-primary"
              data-ocid={`admin.edit_button.${i + 1}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item.id)}
              className="p-1 text-muted-foreground hover:text-destructive"
              data-ocid={`admin.delete_button.${i + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function emptyPublication(): Publication {
  return {
    id: 0n,
    title: "",
    authors: "",
    venue: "",
    year: BigInt(new Date().getFullYear()),
    doi: "",
    url: "",
    isPreprint: false,
    featured: false,
    displayOrder: 0n,
  };
}

function PublicationsTab() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const { data: items, isLoading } = useQuery<Publication[]>({
    queryKey: ["publications"],
    queryFn: () => (actor ? actor.getAllPublications() : Promise.resolve([])),
    enabled: !!actor,
  });

  const [editItem, setEditItem] = useState<Publication | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  function startAdd() {
    setEditItem(emptyPublication());
    setIsNew(true);
  }
  function startEdit(item: Publication) {
    setEditItem({ ...item });
    setIsNew(false);
  }

  async function handleSave() {
    if (!editItem) return;
    setSaving(true);
    try {
      if (isNew) {
        await actor!.createPublication(editItem);
        toast.success("Publication added");
      } else {
        await actor!.updatePublication(editItem.id, editItem);
        toast.success("Publication updated");
      }
      qc.invalidateQueries({ queryKey: ["publications"], refetchType: "all" });
      setEditItem(null);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: bigint) {
    if (!window.confirm("Delete this publication?")) return;
    try {
      await actor!.deletePublication(id);
      qc.invalidateQueries({ queryKey: ["publications"], refetchType: "all" });
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function handleToggleFeatured(item: Publication) {
    try {
      await actor!.updatePublication(item.id, {
        ...item,
        featured: !item.featured,
      });
      qc.invalidateQueries({ queryKey: ["publications"], refetchType: "all" });
      toast.success(
        item.featured ? "Removed from featured" : "Marked as featured",
      );
    } catch {
      toast.error("Failed to update");
    }
  }

  async function handleReorder(list: Publication[], idx: number, dir: -1 | 1) {
    const newItems = [...list];
    const target = idx + dir;
    if (target < 0 || target >= newItems.length) return;
    [newItems[idx], newItems[target]] = [newItems[target], newItems[idx]];
    const order: Array<[bigint, bigint]> = newItems.map((item, i) => [
      item.id,
      BigInt(i),
    ]);
    try {
      await actor!.updatePublicationOrder(order);
      qc.invalidateQueries({ queryKey: ["publications"], refetchType: "all" });
    } catch {
      toast.error("Failed to reorder");
    }
  }

  if (isLoading)
    return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (editItem) {
    return (
      <div className="space-y-4 max-w-xl" data-ocid="admin.panel">
        <h3 className="font-medium">
          {isNew ? "Add Publication" : "Edit Publication"}
        </h3>
        <div className="space-y-1">
          <Label className="text-xs">Title</Label>
          <Input
            value={editItem.title}
            onChange={(e) =>
              setEditItem({ ...editItem, title: e.target.value })
            }
            className="text-sm"
            data-ocid="admin.input"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Authors</Label>
          <Input
            value={editItem.authors}
            onChange={(e) =>
              setEditItem({ ...editItem, authors: e.target.value })
            }
            className="text-sm"
            data-ocid="admin.input"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Venue/Journal</Label>
            <Input
              value={editItem.venue}
              onChange={(e) =>
                setEditItem({ ...editItem, venue: e.target.value })
              }
              className="text-sm"
              data-ocid="admin.input"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Year</Label>
            <Input
              type="number"
              value={Number(editItem.year)}
              onChange={(e) =>
                setEditItem({ ...editItem, year: BigInt(e.target.value || 0) })
              }
              className="text-sm"
              data-ocid="admin.input"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">DOI</Label>
          <Input
            value={editItem.doi}
            onChange={(e) => setEditItem({ ...editItem, doi: e.target.value })}
            placeholder="10.xxxx/xxxxx"
            className="text-sm"
            data-ocid="admin.input"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="featured"
            checked={editItem.featured}
            onChange={(e) =>
              setEditItem({ ...editItem, featured: e.target.checked })
            }
            data-ocid="admin.checkbox"
          />
          <Label htmlFor="featured" className="text-sm">
            Featured (Kante in first 3 authors)
          </Label>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground hover:opacity-90"
            data-ocid="admin.save_button"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Save
          </Button>
          <Button
            variant="outline"
            onClick={() => setEditItem(null)}
            data-ocid="admin.cancel_button"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-ocid="admin.panel">
      <Button
        size="sm"
        onClick={startAdd}
        className="bg-primary text-primary-foreground hover:opacity-90"
        data-ocid="admin.primary_button"
      >
        <Plus className="h-4 w-4 mr-1" /> Add Publication
      </Button>
      {(!items || items.length === 0) && (
        <p className="text-sm text-muted-foreground">No publications.</p>
      )}
      {items?.map((item, i) => (
        <div
          key={String(item.id)}
          className="flex items-center gap-2 border border-border rounded p-3"
          data-ocid={`admin.item.${i + 1}`}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{item.title}</p>
            <p className="text-xs text-muted-foreground">
              {item.venue} · {Number(item.year)}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleToggleFeatured(item)}
              title={
                item.featured
                  ? "Remove from homepage featured"
                  : "Add to homepage featured"
              }
              className={`p-1 transition-colors ${item.featured ? "text-primary hover:text-muted-foreground" : "text-muted-foreground hover:text-primary"}`}
              data-ocid={`admin.toggle_button.${i + 1}`}
            >
              <Star
                className={`h-4 w-4 ${item.featured ? "fill-primary" : ""}`}
              />
            </button>
            <button
              type="button"
              onClick={() => handleReorder(items, i, -1)}
              disabled={i === 0}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
              data-ocid={`admin.secondary_button.${i + 1}`}
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleReorder(items, i, 1)}
              disabled={i === items.length - 1}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
              data-ocid={`admin.secondary_button.${i + 1}`}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => startEdit(item)}
              className="p-1 text-muted-foreground hover:text-primary"
              data-ocid={`admin.edit_button.${i + 1}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item.id)}
              className="p-1 text-muted-foreground hover:text-destructive"
              data-ocid={`admin.delete_button.${i + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function emptyLanguage(): Language {
  return {
    id: 0n,
    name: emptyLocalized(),
    level: emptyLocalized(),
    displayOrder: 0n,
  };
}

function LanguagesTab() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const { data: items, isLoading } = useQuery<Language[]>({
    queryKey: ["languages"],
    queryFn: () => (actor ? actor.getAllLanguages() : Promise.resolve([])),
    enabled: !!actor,
  });

  const [editItem, setEditItem] = useState<Language | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  function startAdd() {
    setEditItem(emptyLanguage());
    setIsNew(true);
  }
  function startEdit(item: Language) {
    setEditItem({ ...item });
    setIsNew(false);
  }

  async function handleSave() {
    if (!editItem) return;
    setSaving(true);
    try {
      if (isNew) {
        await actor!.createLanguage(editItem);
        toast.success("Language added");
      } else {
        await actor!.updateLanguage(editItem.id, editItem);
        toast.success("Language updated");
      }
      qc.invalidateQueries({ queryKey: ["languages"], refetchType: "all" });
      setEditItem(null);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: bigint) {
    if (!window.confirm("Delete this language?")) return;
    try {
      await actor!.deleteLanguage(id);
      qc.invalidateQueries({ queryKey: ["languages"], refetchType: "all" });
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function handleReorder(list: Language[], idx: number, dir: -1 | 1) {
    const newItems = [...list];
    const target = idx + dir;
    if (target < 0 || target >= newItems.length) return;
    [newItems[idx], newItems[target]] = [newItems[target], newItems[idx]];
    const order: Array<[bigint, bigint]> = newItems.map((item, i) => [
      item.id,
      BigInt(i),
    ]);
    try {
      await actor!.updateLanguageOrder(order);
      qc.invalidateQueries({ queryKey: ["languages"], refetchType: "all" });
    } catch {
      toast.error("Failed to reorder");
    }
  }

  if (isLoading)
    return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (editItem) {
    return (
      <div className="space-y-4 max-w-xl" data-ocid="admin.panel">
        <h3 className="font-medium">
          {isNew ? "Add Language" : "Edit Language"}
        </h3>
        <LocalizedInput
          label="Language Name"
          value={editItem.name}
          onChange={(v) => setEditItem({ ...editItem, name: v })}
        />
        <LocalizedInput
          label="Level"
          value={editItem.level}
          onChange={(v) => setEditItem({ ...editItem, level: v })}
        />
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground hover:opacity-90"
            data-ocid="admin.save_button"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Save
          </Button>
          <Button
            variant="outline"
            onClick={() => setEditItem(null)}
            data-ocid="admin.cancel_button"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-ocid="admin.panel">
      <Button
        size="sm"
        onClick={startAdd}
        className="bg-primary text-primary-foreground hover:opacity-90"
        data-ocid="admin.primary_button"
      >
        <Plus className="h-4 w-4 mr-1" /> Add Language
      </Button>
      {(!items || items.length === 0) && (
        <p className="text-sm text-muted-foreground">No languages.</p>
      )}
      {items?.map((item, i) => (
        <div
          key={String(item.id)}
          className="flex items-center gap-2 border border-border rounded p-3"
          data-ocid={`admin.item.${i + 1}`}
        >
          <div className="flex-1">
            <p className="text-sm font-medium">{item.name.en}</p>
            <p className="text-xs text-muted-foreground">{item.level.en}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleReorder(items, i, -1)}
              disabled={i === 0}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
              data-ocid={`admin.secondary_button.${i + 1}`}
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleReorder(items, i, 1)}
              disabled={i === items.length - 1}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
              data-ocid={`admin.secondary_button.${i + 1}`}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => startEdit(item)}
              className="p-1 text-muted-foreground hover:text-primary"
              data-ocid={`admin.edit_button.${i + 1}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item.id)}
              className="p-1 text-muted-foreground hover:text-destructive"
              data-ocid={`admin.delete_button.${i + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function emptySocialLink(): SocialLink {
  return { id: 0n, platform: "", url: "", displayOrder: 0n };
}

function SocialLinksTab() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const { data: items, isLoading } = useQuery<SocialLink[]>({
    queryKey: ["socialLinks"],
    queryFn: () => (actor ? actor.getAllSocialLinks() : Promise.resolve([])),
    enabled: !!actor,
  });

  const [editItem, setEditItem] = useState<SocialLink | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  function startAdd() {
    setEditItem(emptySocialLink());
    setIsNew(true);
  }
  function startEdit(item: SocialLink) {
    setEditItem({ ...item });
    setIsNew(false);
  }

  async function handleSave() {
    if (!editItem) return;
    setSaving(true);
    try {
      if (isNew) {
        await actor!.createSocialLink(editItem);
        toast.success("Social link added");
      } else {
        await actor!.updateSocialLink(editItem.id, editItem);
        toast.success("Social link updated");
      }
      qc.invalidateQueries({ queryKey: ["socialLinks"], refetchType: "all" });
      setEditItem(null);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: bigint) {
    if (!window.confirm("Delete this social link?")) return;
    try {
      await actor!.deleteSocialLink(id);
      qc.invalidateQueries({ queryKey: ["socialLinks"], refetchType: "all" });
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function handleReorder(list: SocialLink[], idx: number, dir: -1 | 1) {
    const newItems = [...list];
    const target = idx + dir;
    if (target < 0 || target >= newItems.length) return;
    [newItems[idx], newItems[target]] = [newItems[target], newItems[idx]];
    const order: Array<[bigint, bigint]> = newItems.map((item, i) => [
      item.id,
      BigInt(i),
    ]);
    try {
      await actor!.updateSocialLinksOrder(order);
      qc.invalidateQueries({ queryKey: ["socialLinks"], refetchType: "all" });
    } catch {
      toast.error("Failed to reorder");
    }
  }

  if (isLoading)
    return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (editItem) {
    return (
      <div className="space-y-4 max-w-xl" data-ocid="admin.panel">
        <h3 className="font-medium">
          {isNew ? "Add Social Link" : "Edit Social Link"}
        </h3>
        <div className="space-y-1">
          <Label className="text-xs">Platform</Label>
          <Input
            value={editItem.platform}
            onChange={(e) =>
              setEditItem({ ...editItem, platform: e.target.value })
            }
            placeholder="linkedin, github, twitter…"
            className="text-sm"
            data-ocid="admin.input"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">URL</Label>
          <Input
            value={editItem.url}
            onChange={(e) => setEditItem({ ...editItem, url: e.target.value })}
            className="text-sm"
            data-ocid="admin.input"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground hover:opacity-90"
            data-ocid="admin.save_button"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Save
          </Button>
          <Button
            variant="outline"
            onClick={() => setEditItem(null)}
            data-ocid="admin.cancel_button"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-ocid="admin.panel">
      <Button
        size="sm"
        onClick={startAdd}
        className="bg-primary text-primary-foreground hover:opacity-90"
        data-ocid="admin.primary_button"
      >
        <Plus className="h-4 w-4 mr-1" /> Add Social Link
      </Button>
      {(!items || items.length === 0) && (
        <p className="text-sm text-muted-foreground">No social links.</p>
      )}
      {items?.map((item, i) => (
        <div
          key={String(item.id)}
          className="flex items-center gap-2 border border-border rounded p-3"
          data-ocid={`admin.item.${i + 1}`}
        >
          <div className="flex-1">
            <p className="text-sm font-medium capitalize">{item.platform}</p>
            <p className="text-xs text-muted-foreground truncate">{item.url}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleReorder(items, i, -1)}
              disabled={i === 0}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
              data-ocid={`admin.secondary_button.${i + 1}`}
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleReorder(items, i, 1)}
              disabled={i === items.length - 1}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
              data-ocid={`admin.secondary_button.${i + 1}`}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => startEdit(item)}
              className="p-1 text-muted-foreground hover:text-primary"
              data-ocid={`admin.edit_button.${i + 1}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item.id)}
              className="p-1 text-muted-foreground hover:text-destructive"
              data-ocid={`admin.delete_button.${i + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── PROJECTS TAB ────────────────────────────────────────────────────────────

function emptyProjectInput(): OngoingProjectInput {
  return {
    title: emptyLocalized(),
    fundingSource: emptyLocalized(),
    objectives: emptyLocalized(),
    workplan: emptyLocalized(),
    objectiveStatuses: [],
    gallery: [],
    displayOrder: 0n,
  };
}

function ObjectiveStatusEditor({
  items,
  onChange,
}: {
  items: ObjectiveWithStatus[];
  onChange: (v: ObjectiveWithStatus[]) => void;
}) {
  const statusOptions: ObjectiveStatus[] = [
    ObjectiveStatus.NotStarted,
    ObjectiveStatus.InProgress,
    ObjectiveStatus.Completed,
  ];

  function addItem() {
    onChange([...items, { objective: "", status: ObjectiveStatus.NotStarted }]);
  }

  function removeItem(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, patch: Partial<ObjectiveWithStatus>) {
    onChange(
      items.map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Objective Statuses</p>
        <button
          type="button"
          onClick={addItem}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          <Plus className="h-3 w-3" /> Add objective
        </button>
      </div>
      {items.map((item, idx) => (
        <div
          key={`${idx}-${item.objective}`}
          className="flex items-start gap-2"
        >
          <Input
            value={item.objective}
            onChange={(e) => updateItem(idx, { objective: e.target.value })}
            placeholder="Objective description"
            className="text-sm flex-1"
            data-ocid="admin.input"
          />
          <select
            value={item.status}
            onChange={(e) =>
              updateItem(idx, { status: e.target.value as ObjectiveStatus })
            }
            className="text-sm border border-input rounded-md px-2 py-1.5 bg-background text-foreground h-9"
            data-ocid="admin.select"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s === "NotStarted"
                  ? "Not Started"
                  : s === "InProgress"
                    ? "In Progress"
                    : "Completed"}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => removeItem(idx)}
            className="p-1.5 text-muted-foreground hover:text-destructive"
            aria-label="Remove objective"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function GalleryManager({
  projectId,
  gallery,
  onUpdate,
}: {
  projectId: bigint;
  gallery: string[];
  onUpdate: (urls: string[]) => void;
}) {
  const { actor } = useActor();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !actor) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const config = await loadConfig();
      const agent = new HttpAgent({ host: config.backend_host });
      if (config.backend_host?.includes("localhost")) {
        await agent.fetchRootKey().catch(() => {});
      }
      const storageClient = new StorageClient(
        config.bucket_name ?? "default-bucket",
        config.storage_gateway_url ?? "https://blob.caffeine.ai",
        config.backend_canister_id,
        config.project_id ?? "0000000-0000-0000-0000-00000000000",
        agent,
      );
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });
      const { hash } = await storageClient.putFile(
        await blob.getBytes(),
        blob.onProgress,
      );
      const imageUrl = await storageClient.getDirectURL(hash);
      const result = await actor.addGalleryImage(projectId, imageUrl);
      if (result) {
        onUpdate(result.gallery);
        toast.success("Image uploaded");
      }
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = "";
    }
  }

  async function handleRemove(url: string) {
    if (!actor) return;
    try {
      const result = await actor.removeGalleryImage(projectId, url);
      if (result) {
        onUpdate(result.gallery);
        toast.success("Removed");
      }
    } catch {
      toast.error("Failed to remove");
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Gallery</p>

      {/* File upload button */}
      <div className="flex items-center gap-2">
        <label
          className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-md border border-input text-sm bg-background text-foreground hover:bg-muted transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}
          data-ocid="admin.upload_button"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {uploadProgress > 0 ? `${uploadProgress}%` : "Uploading…"}
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload Image
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
            disabled={uploading}
            data-ocid="admin.input"
          />
        </label>
        <span className="text-xs text-muted-foreground">
          JPG, PNG, WebP, GIF
        </span>
      </div>

      {/* Gallery grid */}
      {gallery.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {gallery.map((url) => (
            <div key={url} className="relative group aspect-square">
              <img
                src={url}
                alt="Project gallery entry"
                className="w-full h-full object-cover rounded border border-border"
              />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectsTab() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const { data: items, isLoading } = useQuery<OngoingProject[]>({
    queryKey: ["ongoingProjects"],
    queryFn: () =>
      actor ? actor.getAllOngoingProjects() : Promise.resolve([]),
    enabled: !!actor,
  });

  const [editItem, setEditItem] = useState<OngoingProjectInput | null>(null);
  const [editId, setEditId] = useState<bigint | null>(null);
  const [editGallery, setEditGallery] = useState<string[]>([]);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  function startAdd() {
    setEditItem(emptyProjectInput());
    setEditId(null);
    setEditGallery([]);
    setIsNew(true);
  }

  function startEdit(project: OngoingProject) {
    setEditItem({
      title: project.title,
      fundingSource: project.fundingSource,
      objectives: project.objectives,
      workplan: project.workplan,
      objectiveStatuses: [...project.objectiveStatuses],
      gallery: [...project.gallery],
      displayOrder: project.displayOrder,
    });
    setEditId(project.id);
    setEditGallery([...project.gallery]);
    setIsNew(false);
  }

  async function handleSave() {
    if (!editItem) return;
    setSaving(true);
    try {
      if (isNew) {
        await actor!.createOngoingProject(editItem);
        toast.success("Project created");
      } else if (editId !== null) {
        await actor!.updateOngoingProject(editId, editItem);
        toast.success("Project updated");
      }
      qc.invalidateQueries({
        queryKey: ["ongoingProjects"],
        refetchType: "all",
      });
      setEditItem(null);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: bigint) {
    if (!window.confirm("Delete this project?")) return;
    try {
      await actor!.deleteOngoingProject(id);
      qc.invalidateQueries({
        queryKey: ["ongoingProjects"],
        refetchType: "all",
      });
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function handleReorder(
    list: OngoingProject[],
    idx: number,
    dir: -1 | 1,
  ) {
    const newItems = [...list];
    const target = idx + dir;
    if (target < 0 || target >= newItems.length) return;
    [newItems[idx], newItems[target]] = [newItems[target], newItems[idx]];
    const ids = newItems.map((item) => item.id);
    try {
      await actor!.updateOngoingProjectOrder(ids);
      qc.invalidateQueries({
        queryKey: ["ongoingProjects"],
        refetchType: "all",
      });
    } catch {
      toast.error("Failed to reorder");
    }
  }

  if (isLoading)
    return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (editItem) {
    return (
      <div className="space-y-5 max-w-xl" data-ocid="admin.panel">
        <h3 className="font-medium">
          {isNew ? "Add Project" : "Edit Project"}
        </h3>
        <LocalizedInput
          label="Title"
          value={editItem.title}
          onChange={(v) => setEditItem({ ...editItem, title: v })}
        />
        <LocalizedInput
          label="Funding Source"
          value={editItem.fundingSource}
          onChange={(v) => setEditItem({ ...editItem, fundingSource: v })}
        />
        <LocalizedInput
          label="Objectives"
          value={editItem.objectives}
          onChange={(v) => setEditItem({ ...editItem, objectives: v })}
          multiline
        />
        <LocalizedInput
          label="Workplan"
          value={editItem.workplan}
          onChange={(v) => setEditItem({ ...editItem, workplan: v })}
          multiline
        />
        <ObjectiveStatusEditor
          items={editItem.objectiveStatuses}
          onChange={(v) => setEditItem({ ...editItem, objectiveStatuses: v })}
        />

        {/* Gallery — only shown when editing an existing project */}
        {!isNew && editId !== null && (
          <GalleryManager
            projectId={editId}
            gallery={editGallery}
            onUpdate={(urls) => {
              setEditGallery(urls);
              setEditItem({ ...editItem, gallery: urls });
            }}
          />
        )}
        {isNew && (
          <p className="text-xs text-muted-foreground">
            Save the project first, then add gallery media in the edit view.
          </p>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground hover:opacity-90"
            data-ocid="admin.save_button"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Save
          </Button>
          <Button
            variant="outline"
            onClick={() => setEditItem(null)}
            data-ocid="admin.cancel_button"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-ocid="admin.panel">
      <Button
        size="sm"
        onClick={startAdd}
        className="bg-primary text-primary-foreground hover:opacity-90"
        data-ocid="admin.primary_button"
      >
        <Plus className="h-4 w-4 mr-1" /> Add Project
      </Button>
      {(!items || items.length === 0) && (
        <p className="text-sm text-muted-foreground">No projects yet.</p>
      )}
      {items?.map((item, i) => (
        <div
          key={String(item.id)}
          className="flex items-center gap-2 border border-border rounded p-3"
          data-ocid={`admin.item.${i + 1}`}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{item.title.en}</p>
            <p className="text-xs text-muted-foreground">
              {item.objectiveStatuses.length} objectives · {item.gallery.length}{" "}
              media
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => handleReorder(items, i, -1)}
              disabled={i === 0}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
              data-ocid={`admin.secondary_button.${i + 1}`}
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleReorder(items, i, 1)}
              disabled={i === items.length - 1}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
              data-ocid={`admin.secondary_button.${i + 1}`}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => startEdit(item)}
              className="p-1 text-muted-foreground hover:text-primary"
              data-ocid={`admin.edit_button.${i + 1}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item.id)}
              className="p-1 text-muted-foreground hover:text-destructive"
              data-ocid={`admin.delete_button.${i + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── RELEVANT LINKS TAB ──────────────────────────────────────────────────────

function emptyRelevantLinkInput(): RelevantLinkInput {
  return {
    title: emptyLocalized(),
    url: "",
    description: undefined,
    displayOrder: 0n,
  };
}

function RelevantLinksTab() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const { data: items, isLoading } = useQuery<RelevantLink[]>({
    queryKey: ["relevantLinks"],
    queryFn: () => (actor ? actor.getAllRelevantLinks() : Promise.resolve([])),
    enabled: !!actor,
  });

  const [editItem, setEditItem] = useState<RelevantLinkInput | null>(null);
  const [editId, setEditId] = useState<bigint | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);

  function startAdd() {
    setEditItem(emptyRelevantLinkInput());
    setEditId(null);
    setIsNew(true);
    setHasDescription(false);
  }

  function startEdit(link: RelevantLink) {
    setEditItem({
      title: link.title,
      url: link.url,
      description: link.description,
      displayOrder: link.displayOrder,
    });
    setEditId(link.id);
    setIsNew(false);
    setHasDescription(!!link.description);
  }

  async function handleSave() {
    if (!editItem) return;
    setSaving(true);
    try {
      const input: RelevantLinkInput = {
        ...editItem,
        description: hasDescription
          ? (editItem.description ?? emptyLocalized())
          : undefined,
      };
      if (isNew) {
        await actor!.createRelevantLink(input);
        toast.success("Link added");
      } else if (editId !== null) {
        await actor!.updateRelevantLink(editId, input);
        toast.success("Link updated");
      }
      qc.invalidateQueries({ queryKey: ["relevantLinks"], refetchType: "all" });
      setEditItem(null);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: bigint) {
    if (!window.confirm("Delete this link?")) return;
    try {
      await actor!.deleteRelevantLink(id);
      qc.invalidateQueries({ queryKey: ["relevantLinks"], refetchType: "all" });
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function handleReorder(list: RelevantLink[], idx: number, dir: -1 | 1) {
    const newItems = [...list];
    const target = idx + dir;
    if (target < 0 || target >= newItems.length) return;
    [newItems[idx], newItems[target]] = [newItems[target], newItems[idx]];
    const ids = newItems.map((item) => item.id);
    try {
      await actor!.updateRelevantLinksOrder(ids);
      qc.invalidateQueries({ queryKey: ["relevantLinks"], refetchType: "all" });
    } catch {
      toast.error("Failed to reorder");
    }
  }

  if (isLoading)
    return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (editItem) {
    return (
      <div className="space-y-4 max-w-xl" data-ocid="admin.panel">
        <h3 className="font-medium">
          {isNew ? "Add Relevant Link" : "Edit Relevant Link"}
        </h3>
        <LocalizedInput
          label="Title"
          value={editItem.title}
          onChange={(v) => setEditItem({ ...editItem, title: v })}
        />
        <div className="space-y-1">
          <Label className="text-xs">URL</Label>
          <Input
            value={editItem.url}
            onChange={(e) => setEditItem({ ...editItem, url: e.target.value })}
            placeholder="https://example.org"
            className="text-sm"
            data-ocid="admin.input"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="has-desc"
            checked={hasDescription}
            onChange={(e) => setHasDescription(e.target.checked)}
            data-ocid="admin.checkbox"
          />
          <Label htmlFor="has-desc" className="text-sm">
            Add description (optional)
          </Label>
        </div>
        {hasDescription && (
          <LocalizedInput
            label="Description"
            value={editItem.description ?? emptyLocalized()}
            onChange={(v) => setEditItem({ ...editItem, description: v })}
          />
        )}
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground hover:opacity-90"
            data-ocid="admin.save_button"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Save
          </Button>
          <Button
            variant="outline"
            onClick={() => setEditItem(null)}
            data-ocid="admin.cancel_button"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-ocid="admin.panel">
      <Button
        size="sm"
        onClick={startAdd}
        className="bg-primary text-primary-foreground hover:opacity-90"
        data-ocid="admin.primary_button"
      >
        <Plus className="h-4 w-4 mr-1" /> Add Link
      </Button>
      {(!items || items.length === 0) && (
        <p className="text-sm text-muted-foreground">No relevant links yet.</p>
      )}
      {items?.map((item, i) => (
        <div
          key={String(item.id)}
          className="flex items-center gap-2 border border-border rounded p-3"
          data-ocid={`admin.item.${i + 1}`}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{item.title.en}</p>
            <p className="text-xs text-muted-foreground truncate">{item.url}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => handleReorder(items, i, -1)}
              disabled={i === 0}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
              data-ocid={`admin.secondary_button.${i + 1}`}
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleReorder(items, i, 1)}
              disabled={i === items.length - 1}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
              data-ocid={`admin.secondary_button.${i + 1}`}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => startEdit(item)}
              className="p-1 text-muted-foreground hover:text-primary"
              data-ocid={`admin.edit_button.${i + 1}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item.id)}
              className="p-1 text-muted-foreground hover:text-destructive"
              data-ocid={`admin.delete_button.${i + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────

function SettingsTab() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const qc = useQueryClient();
  const [principalInput, setPrincipalInput] = useState("");
  const [granting, setGranting] = useState(false);
  const [resetting, setResetting] = useState(false);

  const myPrincipal = identity?.getPrincipal().toString() ?? "";

  async function handleCopy() {
    await navigator.clipboard.writeText(myPrincipal);
    toast.success("Principal copied to clipboard");
  }

  async function handleGrantAdmin() {
    if (!actor || !principalInput.trim()) return;
    setGranting(true);
    try {
      const { Principal } = await import("@dfinity/principal");
      const p = Principal.fromText(principalInput.trim());
      await actor.assignCallerUserRole(p, UserRole.admin);
      toast.success("Admin role granted successfully");
      setPrincipalInput("");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to grant admin role";
      toast.error(msg);
    } finally {
      setGranting(false);
    }
  }

  return (
    <div className="space-y-8 max-w-xl">
      {/* Section 1 – Connection */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground border-b pb-2">
          Connection
        </h2>
        <div className="space-y-2">
          <Label>Your Principal ID</Label>
          <div className="flex gap-2">
            <Input
              readOnly
              value={myPrincipal}
              className="font-mono text-sm bg-muted"
              data-ocid="settings.input"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              title="Copy principal"
              data-ocid="settings.secondary_button"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="grant-principal">Grant Admin Role to Principal</Label>
          <Input
            id="grant-principal"
            placeholder="Principal ID (e.g. aaaaa-aa)"
            value={principalInput}
            onChange={(e) => setPrincipalInput(e.target.value)}
            className="font-mono text-sm"
            data-ocid="settings.search_input"
          />
          <Button
            onClick={handleGrantAdmin}
            disabled={granting || !principalInput.trim()}
            data-ocid="settings.primary_button"
          >
            {granting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Grant Admin
          </Button>
        </div>
      </section>

      {/* Section 2 – Access Token */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground border-b pb-2">
          Access Token
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The access token is a one-time password used when first logging in to
          claim admin status. It was set during initial deployment. To use it,
          append{" "}
          <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
            #caffeineAdminToken=YOUR_TOKEN
          </code>{" "}
          to the admin URL when signing in for the first time on a new identity.
        </p>
      </section>

      {/* Section 3 – Data */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground border-b pb-2">
          Data
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Reset all content to the built-in default seed data. This will
          overwrite the current profile, experiences, education, publications,
          languages, and social links.
        </p>
        <Button
          variant="outline"
          className="border-destructive text-destructive hover:bg-destructive/10"
          disabled={resetting}
          onClick={async () => {
            setResetting(true);
            try {
              await actor!.seedInitialData();
              await qc.invalidateQueries();
              toast.success("Data reset to default seed data");
            } catch (e: unknown) {
              const msg =
                e instanceof Error ? e.message : "Failed to reset data";
              toast.error(msg);
            } finally {
              setResetting(false);
            }
          }}
          data-ocid="settings.delete_button"
        >
          {resetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Reset to Default Data
        </Button>
      </section>
    </div>
  );
}

// ─── MAIN ADMIN COMPONENT ─────────────────────────────────────────────────────

export default function Admin() {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const isAnonymous = !identity || identity.getPrincipal().isAnonymous();
  const isAuthenticated = !isAnonymous;

  useSessionTimeout(clear, isAuthenticated && isAdmin === true);

  // Always clear any cached II delegation on mount — sign-in is always required
  // biome-ignore lint/correctness/useExhaustiveDependencies: clear is stable
  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!actor || isFetching || isAnonymous) {
      setIsAdmin(null);
      return;
    }
    actor
      .isCallerAdmin()
      .then(setIsAdmin)
      .catch(() => setIsAdmin(false));
  }, [actor, isFetching, isAnonymous]);

  if (isInitializing || isFetching) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isAnonymous) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6"
        data-ocid="admin.section"
      >
        <div className="text-center">
          <h1 className="font-serif text-2xl font-normal mb-2">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Sign in to manage content
          </p>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="bg-primary text-primary-foreground hover:opacity-90"
            data-ocid="admin.primary_button"
          >
            {isLoggingIn ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Sign In
          </Button>
        </div>
        <Toaster />
      </div>
    );
  }

  if (isAdmin === null) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-ocid="admin.error_state"
      >
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Access denied. You are not an admin.
          </p>
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-ocid="admin.section">
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-serif text-base">Admin Panel</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {identity.getPrincipal().toString().slice(0, 12)}…
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                window.location.href = "/";
              }}
              className="text-muted-foreground hover:text-foreground"
              data-ocid="admin.secondary_button"
            >
              <LogOut className="h-4 w-4 mr-1" /> Exit
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)}>
          <TabsList
            className="mb-6 flex-wrap h-auto gap-1"
            data-ocid="admin.tab"
          >
            <TabsTrigger value="profile" data-ocid="admin.tab">
              Profile
            </TabsTrigger>
            <TabsTrigger value="experience" data-ocid="admin.tab">
              Experience
            </TabsTrigger>
            <TabsTrigger value="education" data-ocid="admin.tab">
              Education
            </TabsTrigger>
            <TabsTrigger value="publications" data-ocid="admin.tab">
              Publications
            </TabsTrigger>
            <TabsTrigger value="languages" data-ocid="admin.tab">
              Languages
            </TabsTrigger>
            <TabsTrigger value="social" data-ocid="admin.tab">
              Social Links
            </TabsTrigger>
            <TabsTrigger value="projects" data-ocid="admin.tab">
              Projects
            </TabsTrigger>
            <TabsTrigger value="relevant-links" data-ocid="admin.tab">
              Relevant Links
            </TabsTrigger>
            <TabsTrigger value="settings" data-ocid="admin.tab">
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>
          <TabsContent value="experience">
            <ExperienceTab />
          </TabsContent>
          <TabsContent value="education">
            <EducationTab />
          </TabsContent>
          <TabsContent value="publications">
            <PublicationsTab />
          </TabsContent>
          <TabsContent value="languages">
            <LanguagesTab />
          </TabsContent>
          <TabsContent value="social">
            <SocialLinksTab />
          </TabsContent>
          <TabsContent value="projects">
            <ProjectsTab />
          </TabsContent>
          <TabsContent value="relevant-links">
            <RelevantLinksTab />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>
      <Toaster />
    </div>
  );
}
