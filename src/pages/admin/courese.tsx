import { useMemo, useState } from "react";
import { Check, PlusCircle, Trash2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEnrollmentStore } from "@/lib/enrollment-store";

export default function AdminCoursesPage() {
  const { courses, addCourse, removeCourse, removeCourseInstructor } =
    useEnrollmentStore();
  const [open, setOpen] = useState(false);
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [instructorQuery, setInstructorQuery] = useState("");
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  const normalizedCourseCode = courseCode.trim().toUpperCase();
  const duplicateCourse =
    normalizedCourseCode.length > 0 &&
    courses.some(
      (course) => course.courseCode.trim().toUpperCase() === normalizedCourseCode,
    );

  const allInstructors = useMemo(
    () =>
      [...new Set(courses.flatMap((course) => course.instructors ?? []))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [courses],
  );

  const filteredInstructors = useMemo(() => {
    const query = instructorQuery.trim().toLowerCase();
    return allInstructors.filter((name) => name.toLowerCase().includes(query));
  }, [allInstructors, instructorQuery]);

  const hasExactInstructorMatch = useMemo(() => {
    const query = instructorQuery.trim();
    return [...allInstructors, ...selectedInstructors].some(
      (name) => name.toLowerCase() === query.toLowerCase(),
    );
  }, [allInstructors, instructorQuery, selectedInstructors]);

  const resetForm = () => {
    setCourseCode("");
    setCourseTitle("");
    setInstructorQuery("");
    setSelectedInstructors([]);
    setShowSuggestions(false);
  };

  const addInstructor = (name: string) => {
    const value = name.trim();
    if (!value) return;

    setSelectedInstructors((prev) =>
      prev.some((item) => item.toLowerCase() === value.toLowerCase())
        ? prev
        : [...prev, value],
    );
    setInstructorQuery("");
    setShowSuggestions(true);
  };

  const toggleInstructor = (name: string) => {
    setSelectedInstructors((prev) =>
      prev.some((item) => item.toLowerCase() === name.toLowerCase())
        ? prev.filter((item) => item.toLowerCase() !== name.toLowerCase())
        : [...prev, name],
    );
    setInstructorQuery("");
    setShowSuggestions(true);
  };

  const removeInstructor = (name: string) => {
    setSelectedInstructors((prev) => prev.filter((item) => item !== name));
  };

  const handleAddCourse = () => {
    if (!normalizedCourseCode || !courseTitle.trim() || duplicateCourse) return;

    addCourse({
      courseCode: normalizedCourseCode,
      courseTitle: courseTitle.trim(),
      instructors: selectedInstructors.length > 0 ? selectedInstructors : undefined,
    });

    resetForm();
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">จัดการวิชาเรียน</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {courses.length} วิชา — เพิ่มวิชาใหม่ที่นี่แล้วจะไปโผล่เป็นตัวเลือก ตอนลงทะเบียนให้นักศึกษาที่หน้า "จัดการการลงทะเบียน" ทันที
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) resetForm();
          }}
        >
          <DialogTrigger
            render={
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                <PlusCircle className="h-4 w-4" />
                เพิ่มวิชา
              </button>
            }
          />

          <DialogContent className="w-[420px] max-w-[calc(100vw-32px)] overflow-visible border border-border bg-popover p-0 text-popover-foreground shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <div className="p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-base font-medium text-foreground">เพิ่มวิชาใหม่</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    วิชาที่เพิ่มจะไปโผล่เป็นตัวเลือกตอนลงทะเบียนให้นักศึกษาได้ทันที
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-sm p-1 text-muted-foreground hover:text-foreground"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="mb-2 text-sm text-foreground/90">รหัสวิชา</div>
                  <Input
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                    placeholder="เช่น CPE303"
                  aria-invalid={duplicateCourse}
                    className="h-9 rounded-md border-input bg-background text-foreground placeholder:text-muted-foreground dark:border-white/10 dark:bg-[#3a3a3c] dark:text-white dark:placeholder:text-white/40"
                  />
                {duplicateCourse && (
                  <p className="mt-1 text-xs text-destructive" role="alert">
                    มีรหัสวิชา {normalizedCourseCode} นี้แล้ว
                  </p>
                )}
                </div>

                <div>
                  <div className="mb-2 text-sm text-foreground/90">ชื่อวิชา</div>
                  <Input
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    placeholder="เช่น Mobile Application Development"
                    className="h-9 rounded-md border-input bg-background text-foreground placeholder:text-muted-foreground dark:border-white/10 dark:bg-[#3a3a3c] dark:text-white dark:placeholder:text-white/40"
                  />
                </div>

                <div className="relative">
                  <div className="mb-2 text-sm text-foreground/90">ผู้สอน</div>
                  <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1 focus-within:ring-2 focus-within:ring-ring/30 dark:border-white/10 dark:bg-[#3a3a3c]">
                    {selectedInstructors.map((name) => (
                      <span
                        key={name}
                        className="inline-flex h-6 items-center gap-1 rounded border border-blue-200 bg-blue-50 px-1.5 text-xs text-blue-700 dark:border-white/10 dark:bg-[#222224] dark:text-white"
                      >
                        {name}
                        <button
                          type="button"
                          onClick={() => removeInstructor(name)}
                          aria-label={`ลบ ${name} จากรายชื่อผู้สอนที่เลือก`}
                          className="text-blue-600/70 hover:text-blue-900 dark:text-white/60 dark:hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <Input
                      value={instructorQuery}
                      onFocus={() => setShowSuggestions(true)}
                      onChange={(e) => {
                        setInstructorQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onBlur={() => {
                        window.setTimeout(() => setShowSuggestions(false), 100);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && instructorQuery.trim()) {
                          event.preventDefault();
                          if (filteredInstructors.length === 1) {
                            toggleInstructor(filteredInstructors[0]);
                          } else if (!hasExactInstructorMatch) {
                            addInstructor(instructorQuery);
                          }
                        }
                        if (event.key === "Escape") setShowSuggestions(false);
                      }}
                      placeholder={
                        selectedInstructors.length
                          ? ""
                          : "เลือกหรือพิมพ์ชื่อผู้สอน (ได้หลายคน)"
                      }
                      className="h-7 min-w-[120px] flex-1 border-0 bg-transparent px-0 text-sm text-foreground shadow-none placeholder:text-muted-foreground focus-visible:border-0 focus-visible:ring-0"
                    />
                  </div>

                  {showSuggestions && (
                    <div className="pointer-events-none absolute left-0 right-0 z-[70] mt-1 max-h-40 overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
                      {filteredInstructors.length > 0 &&
                        filteredInstructors.map((name) => (
                          <button
                            key={name}
                            type="button"
                            className="pointer-events-auto flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm text-foreground hover:bg-muted"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => toggleInstructor(name)}
                          >
                            <span>{name}</span>
                            {selectedInstructors.some(
                              (item) => item.toLowerCase() === name.toLowerCase(),
                            ) && <Check className="h-4 w-4" />}
                          </button>
                        ))}

                      {instructorQuery.trim().length > 0 &&
                        !hasExactInstructorMatch && (
                          <button
                            type="button"
                            className="pointer-events-auto mt-1 flex w-full items-center rounded px-2 py-2 text-left text-sm text-foreground hover:bg-muted"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => addInstructor(instructorQuery)}
                          >
                            + เพิ่มผู้สอน "{instructorQuery.trim()}"
                          </button>
                        )}
                    </div>
                  )}

                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <Button
                  onClick={handleAddCourse}
                  disabled={!normalizedCourseCode || !courseTitle.trim() || duplicateCourse}
                  className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  บันทึก
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-lg border border-foreground/25 bg-background">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[80px] text-sm font-medium">รหัสวิชา</TableHead>
              <TableHead className="text-sm font-medium">ชื่อวิชา</TableHead>
              <TableHead className="w-[260px] text-sm font-medium">ผู้สอน</TableHead>
              <TableHead className="w-[90px] text-right text-sm font-medium">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  ยังไม่มีข้อมูลวิชา
                </TableCell>
              </TableRow>
            )}

            {courses.map((course) => (
              <TableRow key={course.courseCode} className="align-middle even:bg-muted/30">
                <TableCell className="font-medium text-foreground">{course.courseCode}</TableCell>
                <TableCell>{course.courseTitle}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {course.instructors?.length ? (
                      course.instructors.map((instructor) => (
                        <Badge
                          key={`${course.courseCode}-${instructor}`}
                          variant="secondary"
                          className="gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700 dark:border-[#2354c7] dark:bg-[#0b2052] dark:text-[#a8d3ff]"
                        >
                          {instructor}
                          <button
                            type="button"
                            onClick={() =>
                              removeCourseInstructor(course.courseCode, instructor)
                            }
                            aria-label={`ลบผู้สอน ${instructor} จาก ${course.courseCode}`}
                            className="rounded-full text-blue-600/80 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 dark:text-[#a8d3ff]/80 dark:hover:text-white dark:focus-visible:ring-[#a8d3ff]"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        ยังไม่มีผู้สอน
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-md border border-red-500/30 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    onClick={() => setCourseToDelete(course.courseCode)}
                    aria-label={`ลบวิชา ${course.courseCode}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={courseToDelete !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setCourseToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบวิชา?</AlertDialogTitle>
            <AlertDialogDescription>
              ลบ {courseToDelete ?? ""} ออกจากรายวิชาที่เปิดสอน
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (courseToDelete) removeCourse(courseToDelete);
                setCourseToDelete(null);
              }}
            >
              ยืนยัน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
