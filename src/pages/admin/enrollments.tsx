import { useState } from "react";
import { Check, PlusCircle, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnrollmentStore } from "@/lib/enrollment-store";

type Option = { value: string; label: string };

function OptionSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Select
      items={options}
      value={value}
      onValueChange={(v) => onChange(v as string)}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function AdminEnrollmentsPage() {
  const { students, courses, enroll, drop } = useEnrollmentStore();

  const [formCourse, setFormCourse] = useState<string | null>(null);
  const [formStudents, setFormStudents] = useState<string[]>([]);
  const [studentQuery, setStudentQuery] = useState("");
  const [showStudentOptions, setShowStudentOptions] = useState(false);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [mode, setMode] = useState<"course" | "student">("course");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStudent, setFilterStudent] = useState("all");

  const studentOptions: Option[] = students.map((s) => ({
    value: s.studentId,
    label: `${s.studentId} — ${s.firstName} ${s.lastName}`,
  }));
  const courseOptions: Option[] = courses.map((c) => ({
    value: c.courseCode,
    label: `${c.courseCode} — ${c.courseTitle}`,
  }));

  const availableStudentOptions = studentOptions.filter(
    (student) =>
      !students
        .find((item) => item.studentId === student.value)
        ?.enrolledCourses.includes(formCourse ?? "") &&
      student.label.toLowerCase().includes(studentQuery.trim().toLowerCase()),
  );

  const handleEnroll = () => {
    if (!formCourse || formStudents.length === 0) return;
    formStudents.forEach((studentId) => enroll(studentId, formCourse));
    setEnrollDialogOpen(false);
  };

  // เคลียร์ฟอร์มทุกครั้งที่ Dialog ปิด ไม่ว่าจะปิดเพราะลงทะเบียนสำเร็จ, กด X,
  // หรือคลิกนอก Dialog — เปิดครั้งหน้าจะได้เริ่มจากฟอร์มว่างเสมอ
  const handleEnrollDialogOpenChange = (open: boolean) => {
    setEnrollDialogOpen(open);
    if (!open) {
      setFormCourse(null);
      setFormStudents([]);
      setStudentQuery("");
      setShowStudentOptions(false);
    }
  };

  const toggleFormStudent = (studentId: string) => {
    setFormStudents((selected) =>
      selected.includes(studentId)
        ? selected.filter((id) => id !== studentId)
        : [...selected, studentId],
    );
    setStudentQuery("");
    setShowStudentOptions(true);
  };

  const studentName = (studentId: string) => {
    const student = students.find((item) => item.studentId === studentId);
    return student ? `${student.firstName} ${student.lastName}` : studentId;
  };

  const nameOf = (studentId: string) => {
    const s = students.find((x) => x.studentId === studentId);
    return s ? `${s.firstName} ${s.lastName}` : "-";
  };

  const courseRows = courses
    .filter((course) => mode === "course"
      ? filterCourse === "all" || course.courseCode === filterCourse
      : filterStudent === "all" || students.some(
          (student) =>
            student.studentId === filterStudent &&
            student.enrolledCourses.includes(course.courseCode),
        ),
    )
    .map((course) => ({
      course,
      students: students.filter(
        (student) =>
          student.enrolledCourses.includes(course.courseCode) &&
          (mode !== "student" ||
            filterStudent === "all" ||
            student.studentId === filterStudent),
      ),
    }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1>
        <p className="text-sm text-muted-foreground">
          Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน
        </p>
      </div>

      <Dialog open={enrollDialogOpen} onOpenChange={handleEnrollDialogOpenChange}>
        <DialogTrigger render={<Button />}>
          <PlusCircle className="h-4 w-4" />
          ลงทะเบียนให้นักศึกษา
        </DialogTrigger>
        <DialogContent
          className="overflow-visible p-4 sm:max-w-sm"
        >
          <DialogHeader className="relative pr-8">
            <DialogTitle>ลงทะเบียนให้นักศึกษา</DialogTitle>
            <DialogDescription>
              เลือกวิชาก่อน แล้วเลือกนักศึกษาที่ยังไม่ได้ลงทะเบียนวิชานั้น (เลือกได้มากกว่า 1 คน)
            </DialogDescription>
            <DialogClose
              render={
                <button
                  type="button"
                  aria-label="ปิดหน้าต่าง"
                  className="absolute right-0 top-0 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                />
              }
            >
              <X className="size-4" />
            </DialogClose>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="formCourse">วิชา</Label>
              <OptionSelect
                id="formCourse"
                options={courseOptions}
                value={formCourse}
                placeholder="เลือกวิชา"
                onChange={(value) => {
                  setFormCourse(value);
                  setFormStudents([]);
                  setStudentQuery("");
                  setShowStudentOptions(false);
                }}
              />
            </div>
            <div className="relative grid gap-1.5">
              <Label htmlFor="formStudents">นักศึกษา</Label>
              <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-background px-2 py-1 focus-within:ring-2 focus-within:ring-ring/50 dark:bg-input/30">
                {formStudents.map((studentId) => (
                  <span
                    key={studentId}
                    className="inline-flex h-6 items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 text-xs text-foreground dark:text-blue-200"
                  >
                    {studentName(studentId)}
                    <button
                      type="button"
                      onClick={() => toggleFormStudent(studentId)}
                      aria-label={`นำ ${studentName(studentId)} ออกจากรายการ`}
                      className="text-muted-foreground hover:text-foreground dark:text-blue-200/80 dark:hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  id="formStudents"
                  value={studentQuery}
                  disabled={!formCourse}
                  onFocus={() => formCourse && setShowStudentOptions(true)}
                  onBlur={() => {
                    window.setTimeout(() => setShowStudentOptions(false), 100);
                  }}
                  onChange={(event) => {
                    setStudentQuery(event.target.value);
                    setShowStudentOptions(true);
                  }}
                  placeholder={
                    !formCourse
                      ? "เลือกวิชาก่อน"
                      : formStudents.length > 0
                        ? ""
                        : "เลือกหรือพิมพ์ชื่อนักศึกษา"
                  }
                  className="h-7 min-w-[120px] flex-1 border-0 bg-transparent px-0 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:bg-transparent disabled:opacity-50"
                />
              </div>
              {showStudentOptions && formCourse && (
                <div className="absolute left-0 right-0 top-full z-[120] mt-1 max-h-48 overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
                  {availableStudentOptions.length > 0 ? (
                    availableStudentOptions.map((student) => (
                      <button
                        key={student.value}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => toggleFormStudent(student.value)}
                        className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-accent"
                      >
                        <span>{student.label}</span>
                        {formStudents.includes(student.value) && (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-2 py-2 text-sm text-muted-foreground">
                      {studentQuery.trim()
                        ? "ไม่พบนักศึกษา"
                        : "นักศึกษาลงทะเบียนวิชานี้ครบแล้ว"}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={!formCourse || formStudents.length === 0}
              onClick={handleEnroll}
            >
              <PlusCircle className="h-4 w-4" />
              {formStudents.length > 0
                ? `ลงทะเบียน (${formStudents.length} คน)`
                : "ลงทะเบียน"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as "course" | "student")}
      >
        <TabsList>
          <TabsTrigger value="course">ค้นหาตามวิชา</TabsTrigger>
          <TabsTrigger value="student">ค้นหาตามนักศึกษา</TabsTrigger>
        </TabsList>
        <TabsContent value="course" className="pt-2">
          <OptionSelect
            id="filterCourse"
            options={[{ value: "all", label: "ทุกวิชา" }, ...courseOptions]}
            value={filterCourse}
            onChange={setFilterCourse}
          />
        </TabsContent>
        <TabsContent value="student" className="pt-2">
          <OptionSelect
            id="filterStudent"
            options={[{ value: "all", label: "ทุกคน" }, ...studentOptions]}
            value={filterStudent}
            onChange={setFilterStudent}
          />
        </TabsContent>
      </Tabs>

      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>จำนวน นศ.</TableHead>
              <TableHead>นักศึกษาที่ลงทะเบียน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courseRows.length === 0 ? (
              <TableRow className="border-border">
                <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                  ไม่พบข้อมูลการลงทะเบียน
                </TableCell>
              </TableRow>
            ) : (
              courseRows.map(({ course, students: enrolledStudents }) => (
                <TableRow key={course.courseCode} className="border-border">
                  <TableCell>{course.courseCode}</TableCell>
                  <TableCell>{course.courseTitle}</TableCell>
                  <TableCell>{enrolledStudents.length}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {enrolledStudents.length ? (
                        enrolledStudents.map((student) => (
                          <Badge
                            key={student.studentId}
                            variant="secondary"
                            className="gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200"
                          >
                            {nameOf(student.studentId)}
                            <button
                              type="button"
                              onClick={() => drop(student.studentId, course.courseCode)}
                              aria-label={`ยกเลิก ${nameOf(student.studentId)} จาก ${course.courseCode}`}
                              className="rounded-full text-blue-700/80 hover:text-blue-900 dark:text-blue-200/80 dark:hover:text-white"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          ยังไม่มีผู้ลงทะเบียน
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
