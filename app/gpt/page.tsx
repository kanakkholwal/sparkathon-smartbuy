"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

type StoreSection = { id: string; name: string; color: string; borderColor?: string; rackColor?: string; racks: { id: string; name: string; x: number; y: number; width: number; height: number; items: string[]; depth?: number; inList?: boolean }[]; };
type RoutePoint = { x: number; y: number; item?: string; section?: string; rackId?: string; };
type ShoppingItem = { id: string; name: string; collected: boolean; section: string; rackId: string; };
type Recommendation = { id: string; name: string; section: string; price: string; };

// Hardcoded data with enhanced store layout
const STORE_SECTIONS: StoreSection[] = [
  {
    id: "dairy",
    name: "Dairy & Eggs",
    color: "bg-blue-50",
    borderColor: "border-blue-200",
    racks: [
      { 
        id: "d1", 
        name: "Milk & Cream", 
        x: 20, 
        y: 40, 
        width: 120, 
        height: 70, 
        items: ["Milk", "Cream"],
        inList: true
      },
      { 
        id: "d2", 
        name: "Cheese", 
        x: 20, 
        y: 120, 
        width: 120, 
        height: 70, 
        items: ["Cheddar", "Mozzarella"],
        inList: false
      },
      { 
        id: "d3", 
        name: "Eggs & Butter", 
        x: 20, 
        y: 200, 
        width: 120, 
        height: 70, 
        items: ["Eggs", "Butter"],
        inList: true
      },
    ]
  },
  {
    id: "produce",
    name: "Produce",
    color: "bg-green-50",
    borderColor: "border-green-200",
    racks: [
      { 
        id: "p1", 
        name: "Fruits", 
        x: 170, 
        y: 40, 
        width: 140, 
        height: 70, 
        items: ["Apples", "Bananas", "Oranges"],
        inList: true
      },
      { 
        id: "p2", 
        name: "Vegetables", 
        x: 170, 
        y: 120, 
        width: 140, 
        height: 70, 
        items: ["Carrots", "Lettuce", "Tomatoes"],
        inList: false
      },
    ]
  },
  {
    id: "bakery",
    name: "Bakery",
    color: "bg-amber-50",
    borderColor: "border-amber-200",
    racks: [
      { 
        id: "b1", 
        name: "Bread", 
        x: 330, 
        y: 40, 
        width: 120, 
        height: 70, 
        items: ["Whole Wheat Bread"],
        inList: true
      },
      { 
        id: "b2", 
        name: "Pastries", 
        x: 330, 
        y: 120, 
        width: 120, 
        height: 70, 
        items: ["Croissants", "Donuts"],
        inList: false
      },
    ]
  },
  {
    id: "meat",
    name: "Meat & Seafood",
    color: "bg-red-50",
    borderColor: "border-red-200",
    racks: [
      { 
        id: "m1", 
        name: "Beef", 
        x: 20, 
        y: 300, 
        width: 120, 
        height: 70, 
        items: ["Ground Beef"],
        inList: false
      },
      { 
        id: "m2", 
        name: "Poultry", 
        x: 20, 
        y: 380, 
        width: 120, 
        height: 70, 
        items: ["Chicken Breast"],
        inList: true
      },
    ]
  },
  {
    id: "frozen",
    name: "Frozen Foods",
    color: "bg-cyan-50",
    borderColor: "border-cyan-200",
    racks: [
      { 
        id: "f1", 
        name: "Frozen Meals", 
        x: 170, 
        y: 300, 
        width: 140, 
        height: 70, 
        items: ["Frozen Pizza"],
        inList: false
      },
      { 
        id: "f2", 
        name: "Ice Cream", 
        x: 170, 
        y: 380, 
        width: 140, 
        height: 70, 
        items: ["Vanilla Ice Cream"],
        inList: false
      },
    ]
  },
  {
    id: "snacks",
    name: "Snacks & Beverages",
    color: "bg-purple-50",
    borderColor: "border-purple-200",
    racks: [
      { 
        id: "s1", 
        name: "Chips & Snacks", 
        x: 330, 
        y: 300, 
        width: 120, 
        height: 70, 
        items: ["Potato Chips"],
        inList: false
      },
      { 
        id: "s2", 
        name: "Soda & Drinks", 
        x: 330, 
        y: 380, 
        width: 120, 
        height: 70, 
        items: ["Cola", "Sparkling Water"],
        inList: true
      },
    ]
  },
  // {
  //   id: "checkout",
  //   name: "Checkout",
  //   color: "bg-gray-100",
  //   borderColor: "border-gray-300",
  //   racks: [
  //     { 
  //       id: "c1", 
  //       name: "Checkout", 
  //       x: 200, 
  //       y: 500, 
  //       width: 100, 
  //       height: 50, 
  //       items: [],
  //       inList: false
  //     },
  //   ]
  // }
];

const INITIAL_SHOPPING_LIST: ShoppingItem[] = [
  { id: "milk", name: "Milk", collected: false, section: "dairy", rackId: "d1" },
  { id: "eggs", name: "Eggs", collected: false, section: "dairy", rackId: "d3" },
  { id: "bread", name: "Whole Wheat Bread", collected: false, section: "bakery", rackId: "b1" },
  { id: "apples", name: "Apples", collected: false, section: "produce", rackId: "p1" },
  { id: "chicken", name: "Chicken Breast", collected: false, section: "meat", rackId: "m2" },
  { id: "sparkling", name: "Sparkling Water", collected: false, section: "snacks", rackId: "s2" },
];

const RECOMMENDATIONS: Recommendation[] = [
  { 
    id: "rec1", 
    name: "Organic Honey", 
    section: "produce", 
    price: "$5.99"
  },
  { 
    id: "rec2", 
    name: "Artisan Cheese", 
    section: "dairy", 
    price: "$7.49"
  },
  { 
    id: "rec3", 
    name: "Sparkling Water", 
    section: "snacks", 
    price: "$3.99"
  },
  { 
    id: "rec4", 
    name: "Frozen Berries", 
    section: "frozen", 
    price: "$4.99"
  },
];

const ROUTE: RoutePoint[] = [
  { x: 240, y: 520, section: "entrance" }, // Entrance
  { x: 330, y: 380, item: "Sparkling Water", section: "snacks", rackId: "s2" }, // Snacks section
  { x: 330, y: 120, item: "Whole Wheat Bread", section: "bakery", rackId: "b1" }, // Bakery
  { x: 240, y: 120, section: "aisle" }, // Aisle
  { x: 170, y: 120, item: "Apples", section: "produce", rackId: "p1" }, // Produce
  { x: 170, y: 40, section: "produce" }, // Produce
  { x: 20, y: 40, section: "dairy" }, // Dairy
  { x: 20, y: 200, item: "Eggs", section: "dairy", rackId: "d3" }, // Dairy
  { x: 20, y: 380, item: "Chicken Breast", section: "meat", rackId: "m2" }, // Meat
  { x: 170, y: 380, section: "frozen" }, // Frozen foods
  { x: 240, y: 380, section: "aisle" }, // Aisle
  { x: 240, y: 500, section: "checkout" }, // Checkout
];

const SECTION_ICONS: Record<string, string> = {
  dairy: "🥛",
  produce: "🍎",
  bakery: "🥖",
  meat: "🍖",
  frozen: "❄️",
  snacks: "🥤",
  checkout: "💳",
  entrance: "🚪",
  aisle: "🛒"
};

export default function SmartBuyDemo() {
  const [shoppingList, setShoppingList] = useState(INITIAL_SHOPPING_LIST);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("entrance");
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isNavigating) return;
    if (currentPosition < ROUTE.length - 1) {
      const t = setTimeout(() => {
        const next = currentPosition + 1;
        setCurrentPosition(next);
        if (ROUTE[next].section) setActiveSection(ROUTE[next].section!);
        if (ROUTE[next].item) {
          setShoppingList(prev => prev.map(i => i.name === ROUTE[next].item ? { ...i, collected: true } : i));
        }
      }, 1000);
      return () => clearTimeout(t);
    } else {
      setIsNavigating(false);
    }
  }, [isNavigating, currentPosition]);

  const startNav = () => { setCurrentPosition(0); setShoppingList(INITIAL_SHOPPING_LIST); setIsNavigating(true); setActiveSection("entrance"); };
  const path = (pts: RoutePoint[], upto: number) => {
    if (!pts.length) return '';
    return pts.slice(0, upto + 1).reduce((p, c, i) => i === 0 ? `M ${c.x} ${c.y}` : `${p} L ${c.x} ${c.y}`, '');
  };
  const progress = (currentPosition/(ROUTE.length-1))*100;

  return (
    <div className="p-4 bg-background min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-primary">SmartBuy+ Demo</h1>
        </div>
        <div className="flex gap-4">
          <div className="w-1/4 space-y-4">
            <Card><CardHeader><CardTitle>List</CardTitle></CardHeader><CardContent>
              <ul className="space-y-2">{shoppingList.map(it => (
                <li key={it.id} className="flex items-center p-2 bg-card rounded-lg border" >
                  <div className={`w-5 h-5 rounded-full mr-2 ${it.collected? 'bg-green-500 border-green-600':'bg-background border-border'}`}>{it.collected?'✓':''}</div>
                  <span className={`${it.collected?'line-through text-muted-foreground':'font-medium'}`}>{it.name}</span>
                </li>
              ))}</ul>
              <Button className="mt-4 w-full" onClick={startNav} disabled={isNavigating}>{isNavigating? 'Navigating...' : 'Start'}</Button>
            </CardContent></Card>
          </div>
          <div className="w-3/4 relative" ref={mapRef} style={{ height: 500 }}>
            {STORE_SECTIONS.map(sec => {
              const xs = sec.racks.map(r=>r.x);
              const ys = sec.racks.map(r=>r.y);
              const ws = sec.racks.map(r=>r.width+r.x);
              const hs = sec.racks.map(r=>r.height+r.y);
              const x = Math.min(...xs)-8; const y = Math.min(...ys)-8;
              const width = Math.max(...ws)-x+8; const height = Math.max(...hs)-y+8;
              return (
                <div key={sec.id} className={`absolute border-2 border-dashed rounded-lg ${sec.color}`} style={{ left: x, top: y, width, height }}>
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-background px-2 text-xs">{sec.name}</Badge>
                  {sec.racks.map(r=> (
                    <motion.div key={r.id} className={`absolute ${sec.rackColor} border rounded-sm ${activeSection===sec.id && ROUTE[currentPosition].item && r.items.includes(ROUTE[currentPosition].item!) ? 'border-4 border-primary animate-pulse':''}`} style={{ left: r.x-x, top: r.y-y, width: r.width, height: r.height }}>
                      <div className="text-xs p-1 truncate flex items-center">
                        <span className="mr-1">{SECTION_ICONS[sec.id]}</span>{r.name}
                      </div>
                    </motion.div>
                  ))}
                </div>
              );
            })}
            <svg className="absolute inset-0 pointer-events-none">
              <path d={path(ROUTE, ROUTE.length-1)} fill="none" stroke="hsl(var(--muted))" strokeWidth={3} strokeDasharray="4,4" />
              <motion.path d={path(ROUTE, currentPosition)} fill="none" stroke="hsl(var(--primary))" strokeWidth={4} initial={{ pathLength:0 }} animate={{ pathLength:1 }} />
              <motion.circle cx={ROUTE[currentPosition].x} cy={ROUTE[currentPosition].y} r={5} fill="hsl(var(--primary))" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
