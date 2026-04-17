"use client";

import Link from "next/link";
import { Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8">
        <div className="flex items-center gap-2 mb-6 font-bold text-xl">
          <Scissors className="h-5 w-5" />
          BookApp
        </div>
        <h1 className="text-2xl font-bold mb-2">Восстановление пароля</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Функция восстановления пароля находится в разработке. Обратитесь к администратору для сброса пароля.
        </p>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Логин или Email</Label>
            <Input placeholder="Введите ваш логин" disabled />
          </div>
          <Button className="w-full" disabled>
            Отправить инструкции (скоро)
          </Button>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/login" className="font-medium hover:underline text-foreground">
            ← Вернуться ко входу
          </Link>
        </p>
      </div>
    </div>
  );
}
