import Image from "next/image";
import { redirect } from "next/navigation";
import SeePdfsPage from "./admin/see-pdfs/page";

export default function Home() {
  return <SeePdfsPage />;
}
