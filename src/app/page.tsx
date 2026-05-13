import Link from "next/link";
import { ArrowRight, MonitorSmartphone, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="entry-page">
      <section className="entry-hero">
        <div className="entry-badge">
          <Sparkles size={16} />
          AI Learning Growth OS
        </div>
        <h1>IvyEd 高频实用英语学习与私域增长系统</h1>
        <p>
          一个 Next.js 双端应用原型：小程序 H5 端承载学习、留资、分享裂变，桌面 Web 端承载教务、CMS 与线索运营。
        </p>
        <div className="entry-actions">
          <Link className="primary-link" href="/mini">
            打开小程序 H5
            <ArrowRight size={18} />
          </Link>
          <Link className="secondary-link" href="/dashboard">
            打开桌面工作台
            <MonitorSmartphone size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
