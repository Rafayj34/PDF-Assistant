import Image from "next/image";
import FileUploadComponent from "./components/fileUpload";

export default function Home() {
  return (
    <div className="">
      <div
        className="min-h-screen w-screen flex"
      >
        <div className="flex justify-center items-center min-h-screen p-4 w-[30vw]">
          <FileUploadComponent />
        </div>
        <div  className="min-h-screen w-[70vw] border-l">2</div>
      </div>


    </div>
  );
}
