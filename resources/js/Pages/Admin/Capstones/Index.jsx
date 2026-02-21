// resources/js/Pages/Admin/Capstones/Index.jsx
import AdminLayout from "../Layouts/AdminLayout";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

import CapstonesToolbar from "./Components/CapstonesToolbar";
import CapstonesTable from "./Components/CapstonesTable";
import CapstonesPagination from "./Components/CapstonesPagination";

export default function Index() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(""); // "" = All
  const [academicYear, setAcademicYear] = useState(""); // "" = All

  const [scope, setScope] = useState("active"); // active | archived

  const [initialLoading, setInitialLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const [q, setQ] = useState("");
  const [perPage, setPerPage] = useState(10);

  const abortRef = useRef(null);
  const debounceRef = useRef(null);
  const requestSeq = useRef(0);

  const yearOptions = ["2023-2024", "2024-2025", "2025-2026"];

  const fetchCategoriesForFilter = async () => {
    try {
      const res = await axios.get("/admin/categories/all", {
        params: { page: 1, q: "", per_page: 999 },
      });
      setCategories(res.data.data ?? []);
    } catch (err) {
      console.error("Fetch categories for filter failed:", err);
    }
  };

  const fetchCapstones = async ({
    page = 1,
    query = q,
    per_page = perPage,
    showInitial = false,
    newScope = scope,
  } = {}) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const seq = ++requestSeq.current;

    if (showInitial) setInitialLoading(true);
    else setFetching(true);

    const url =
      newScope === "archived"
        ? "/admin/capstones/archived"
        : "/admin/capstones/all";

    try {
      const res = await axios.get(url, {
        params: {
          page,
          q: (query ?? "").trim(),
          per_page,
          category_id: categoryId ? Number(categoryId) : undefined,
          academic_year: academicYear || undefined,
        },
        signal: controller.signal,
      });

      if (seq !== requestSeq.current) return;

      setRows(res.data.data ?? []);
      setMeta(res.data);
    } catch (err) {
      if (err?.code === "ERR_CANCELED") return;
      console.error("Fetch capstones failed:", err);
      toast.error("Failed to load capstones.");
    } finally {
      if (showInitial) setInitialLoading(false);
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCapstones({ page: 1, query: "", showInitial: true, newScope: "active" });
    fetchCategoriesForFilter();

    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchCapstones({ page: 1, query: q.trim(), per_page: perPage, newScope: scope });
    }, 400);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // refetch when filters/scope/perPage change
  useEffect(() => {
    if (initialLoading) return;

    fetchCapstones({ page: 1, query: q.trim(), per_page: perPage, newScope: scope });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, academicYear, perPage, scope]);

  const goTo = (linkUrl) => {
    if (!linkUrl) return;
    const url = new URL(linkUrl);
    const page = Number(url.searchParams.get("page") || 1);

    fetchCapstones({ page, query: q.trim(), per_page: perPage, newScope: scope });
  };

  const refreshCurrent = () => {
    const currentPage = meta?.current_page ?? 1;
    fetchCapstones({ page: currentPage, query: q.trim(), per_page: perPage, newScope: scope });
  };

  const archiveCapstone = async (id) => {
    const result = await Swal.fire({
      title: "Archive this capstone?",
      text: "You can restore it later from the Archived tab.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, archive",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setFetching(true);
      const res = await axios.patch(`/admin/capstones/${id}/archive`);
      toast.success(res.data.message || "Capstone archived.");
      refreshCurrent();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Archive failed.");
      setFetching(false);
    }
  };

  const restoreCapstone = async (id) => {
    const result = await Swal.fire({
      title: "Restore this capstone?",
      text: "It will return to the Active list.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, restore",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setFetching(true);
      const res = await axios.patch(`/admin/capstones/${id}/restore`);
      toast.success(res.data.message || "Capstone restored.");
      refreshCurrent();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Restore failed.");
      setFetching(false);
    }
  };

  return (
    <div className="space-y-4">
      <CapstonesToolbar
        scope={scope}
        setScope={(next) => {
          setScope(next);
          setQ("");
          setCategoryId("");
          setAcademicYear("");
        }}
        q={q}
        setQ={setQ}
        perPage={perPage}
        onPerPageChange={(v) => setPerPage(v)}
        categories={categories}
        categoryId={categoryId}
        onCategoryChange={(v) => setCategoryId(v)}
        academicYear={academicYear}
        onAcademicYearChange={(v) => setAcademicYear(v)}
        yearOptions={yearOptions}
        fetching={fetching}
        addHref="/admin/capstones/create"
      />

      <CapstonesTable
        rows={rows}
        initialLoading={initialLoading}
        scope={scope}
        onArchive={archiveCapstone}
        onRestore={restoreCapstone}
      />

      <CapstonesPagination meta={meta} onGoTo={goTo} />
    </div>
  );
}

Index.layout = (page) => <AdminLayout children={page} />;