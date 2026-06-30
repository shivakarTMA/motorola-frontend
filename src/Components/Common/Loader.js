export default function Loader() {
  return (
    <div className="flex flex-col justify-center items-center loader-new">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      <p className="mt-2 text-white">Data Loading...</p>
    </div>
  );
}