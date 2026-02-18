import { Link, usePage } from "@inertiajs/react";
import { HiOutlineAcademicCap } from "react-icons/hi2";
import { AiOutlineDashboard } from "react-icons/ai";
import { FaUsers } from "react-icons/fa";
import { LuBrain } from "react-icons/lu";
import { BiCategoryAlt } from "react-icons/bi";
import NavItem from "./NavItem";

export default function Sidebar() {
  const { props } = usePage();

  const activePage = props?.nav?.page; // comes from controller
  const isActive = (key) => activePage === key;

  return (
    <aside className="hidden w-[280px] shrink-0 p-4 md:block">
      <div className="flex h-full flex-col rounded-3xl bg-primary p-4 shadow-lg">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
            <HiOutlineAcademicCap className="text-2xl" />
          </div>

          <div className="leading-tight">
            <p className="text-base font-semibold text-white">Admin Panel</p>
            <p className="text-xs text-white/70">Capstone Repository</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="mt-4 flex flex-1 flex-col gap-1">
          <NavItem
            href="/admin/dashboard"
            label="Dashboard"
            active={isActive("dashboard")}
            icon={
              <AiOutlineDashboard className="text-xl"/>
            }
          />

          <NavItem
            href="/admin/users"
            label="Users"
            active={isActive("users")}
            icon={
              <FaUsers className="text-xl" />
            }
          />
          <NavItem
            href="/admin/categories"
            label="Categories"
            active={isActive("categories")}
            icon={
              <BiCategoryAlt className="text-xl" />
            }
          />

          <NavItem
            href="/admin/capstones"
            label="Capstone Projects"
            active={isActive("capstones")}
            icon={
              <HiOutlineAcademicCap className="text-xl" />
            }
          />

          <NavItem
            href="/admin/checker"
            label="Proposal Checker"
            active={isActive("checker")}
            icon={
              <LuBrain className="text-xl" />
            }
          />

            <NavItem
            href="/admin/logs"
            label="Audit Logs"
            active={isActive("logs")}
            icon={
              <HiOutlineAcademicCap className="text-xl" />
            }
          />
          
        </nav>

        {/* Footer */}
        <div className="mt-4 space-y-2">
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-xs text-white/70">Signed in as</p>
            <p className="text-sm font-medium text-white">Admin</p>
          </div>

          <Link
            href="/logout"
            method="post"
            as="button"
            className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-primary transition hover:opacity-90 hover:cursor-pointer"
          >
            Logout
          </Link>
        </div>
      </div>
    </aside>
  );
}
