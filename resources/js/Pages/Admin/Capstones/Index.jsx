
import AdminLayout from "../Layouts/AdminLayout";
import { usePage } from "@inertiajs/react";

export default function index() {
    const { header } = usePage().props;

    const title = header?.title ?? "Dashboard";
    const subtitle = header?.subtitle ?? "Overview of your system activity";

    return (
        <AdminLayout title={header?.title} subtitle={header?.subtitle}>
            <h1>Capstones</h1>
        </AdminLayout>
    )
}