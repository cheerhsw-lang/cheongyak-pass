import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="card max-w-md p-8 text-center">
        <h1 className="text-3xl font-black">페이지를 찾을 수 없습니다</h1>
        <p className="mt-3 text-[var(--muted)]">주소가 바뀌었거나 잘못 입력되었을 수 있습니다.</p>
        <Link className="touch btn-fill mt-6 inline-flex rounded-2xl px-5 py-3 font-bold" href="/">
          계산기로 돌아가기
        </Link>
      </div>
    </div>
  );
}
