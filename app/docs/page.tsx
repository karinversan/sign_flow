import { docsFaq } from "@/lib/mock/data";
import Link from "next/link";
import { Home, Radio, Upload } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DocsPage() {
  return (
    <section className="container pb-14 pt-12">
      <div className="page-head flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="page-kicker">Docs and FAQ</p>
          <h1 className="section-title">Docs</h1>
          <p className="page-lead">
            Быстрый старт: перейдите в `/live` для имитации потока и в `/upload` для mock-пайплайна
            задач.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Главная
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/live">
              <Radio className="h-4 w-4" />
              Realtime
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/upload">
              <Upload className="h-4 w-4" />
              Video
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-white/10 bg-black/45">
        <CardHeader>
          <CardTitle>Quick instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Откройте Live и запустите поток кнопкой Start.</li>
            <li>Измените язык/стиль в settings sheet.</li>
            <li>Перейдите в Upload, добавьте mock-файл и создайте job.</li>
            <li>На странице Job отредактируйте transcript и скачайте SRT/VTT.</li>
          </ol>
        </CardContent>
      </Card>

      <Card className="mt-5 border-white/10 bg-black/45">
        <CardHeader>
          <CardTitle>FAQ</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {docsFaq.map((item, index) => (
              <AccordionItem key={item.q} value={`item-${index}`}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </section>
  );
}
