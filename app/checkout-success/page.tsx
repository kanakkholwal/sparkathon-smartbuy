"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

type BasketItem = {
  id: string;
  name: string;
  collected: boolean;
  section: string;
  rackId: string;
  photo?: string;
  price: string;
};

export default function CheckoutSuccess() {
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [total, setTotal] = useState("0.00");
  const [orderId, setOrderId] = useState("");
  const [date, setDate] = useState("");
  const router = useRouter();

  useEffect(() => {
    const basketData = localStorage.getItem("checkout_basket");
    const totalData = localStorage.getItem("checkout_total");
    setBasket(basketData ? JSON.parse(basketData) : []);
    setTotal(totalData || "0.00");
    setOrderId("ORD-" + Math.floor(100000 + Math.random() * 900000));
    setDate(new Date().toLocaleString());
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl shadow-xl border-2 border-green-400">
        <CardHeader className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-4xl">✅</span>
            <CardTitle className="text-3xl text-green-700">Payment Successful</CardTitle>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2 bg-green-100 text-green-700 border-green-400">Thank you for shopping with SmartBuy+</Badge>
          <div className="mt-2 text-muted-foreground text-sm">Order ID: <span className="font-mono">{orderId}</span></div>
          <div className="text-muted-foreground text-sm">{date}</div>
        </CardHeader>
        <CardContent>
          <div className="mt-4 mb-6">
            <h2 className="text-xl font-semibold mb-2">Your Bill</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border rounded-lg">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-left">Image</th>
                    <th className="p-2 text-right">Price ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {basket.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2 font-medium">{item.name}</td>
                      <td className="p-2">
                        {item.photo ? (
                          <img src={item.photo} alt={item.name} className="w-16 h-16 object-cover rounded border" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-2 text-right">{item.price}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted font-bold">
                    <td className="p-2 text-right" colSpan={2}>Total Paid</td>
                    <td className="p-2 text-right">${total}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <div className="flex flex-col items-center mt-6">
            <span className="text-lg text-primary font-semibold">Enjoy your day! 🎉</span>
            <Button className="mt-4" onClick={() => router.push("/")}>Back to Home</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 