import React from 'react';
import { KeyRound, ExternalLink, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function GoogleSetupPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6">
          <KeyRound size={32} />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">
          Công Cụ Lấy Google Refresh Token
        </h1>
        
        <p className="text-zinc-400 mb-8 leading-relaxed">
          Sử dụng công cụ này để nhanh chóng tạo mới <code>GOOGLE_REFRESH_TOKEN</code> mỗi khi bị hết hạn.
        </p>

        <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl mb-8">
          <h3 className="text-amber-400 font-bold mb-2 flex items-center gap-2">
            <AlertTriangle size={20} />
            Tại sao Token lại bị hết hạn sau 7 ngày?
          </h3>
          <p className="text-zinc-300 text-sm leading-relaxed mb-4">
            Theo chính sách của Google, nếu ứng dụng của bạn trong Google Cloud Console đang ở trạng thái <b>"Testing"</b> (Thử nghiệm), Refresh Token sẽ bị bắt buộc hết hạn sau đúng 7 ngày.
          </p>
          <div className="bg-black/50 p-4 rounded-xl text-sm text-zinc-300">
            <b>Cách sửa triệt để (Không bao giờ hết hạn nữa):</b>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>Truy cập <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" className="text-blue-400 hover:underline">Google Cloud Console</a>.</li>
              <li>Chuyển đến mục <b>OAuth consent screen</b> (Màn hình xin phép OAuth).</li>
              <li>Bấm nút <b>PUBLISH APP</b> (Xuất bản ứng dụng) để chuyển trạng thái từ <i>Testing</i> sang <i>In production</i>.</li>
            </ol>
          </div>
        </div>

        <a 
          href="/api/admin/setup-google"
          className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-zinc-200 transition-colors shadow-lg"
        >
          <ExternalLink size={20} />
          Bấm vào đây để lấy Token mới ngay
        </a>

        <div className="mt-6 flex items-start gap-3 text-sm text-zinc-500">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <p>
            Sau khi bấm, bạn hãy đăng nhập Google và cấp quyền. Nó sẽ hiện ra một đoạn mã REFRESH TOKEN. Hãy copy đoạn mã đó và dán vào biến môi trường trên Cloudflare (hoặc Vercel) rồi Deploy lại nhé.
          </p>
        </div>
      </div>
    </div>
  );
}
