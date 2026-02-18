import AdminLayout from "../Layouts/AdminLayout";
import { usePage } from "@inertiajs/react";

export default function index() {
    const {header} = usePage().props;

    const title = header?.title ?? "Dashboard";
    const subtitle = header?.subtitle ?? "Overview of your system activity";


    return (
        <AdminLayout title={title} subtitle={subtitle}>
            <h1>Proposal Checker</h1>
        </AdminLayout>
    );
}