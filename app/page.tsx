// app/page.tsx
"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

// Type definitions
type StoreSection = {
  id: string;
  name: string;
  color: string;
  borderColor: string;
  racks: {
    id: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    items: string[];
    inList?: boolean;
  }[];
};

type RoutePoint = {
  x: number;
  y: number;
  item?: string;
  section?: string;
  rackId?: string;
  isStop: boolean; // New property to mark stops
};

type ShoppingItem = {
  id: string;
  name: string;
  collected: boolean;
  section: string;
  rackId: string;
};

type Recommendation = {
  id: string;
  name: string;
  section: string;
  price: string;
};

// Hardcoded data with enhanced store layout and proper spacing
const STORE_SECTIONS: StoreSection[] = [
  {
    id: "dairy",
    name: "Dairy & Eggs",
    color: "bg-blue-50 dark:bg-blue-900",
    borderColor: "border-blue-200 dark:border-blue-800",
    racks: [
      {
        id: "d1",
        name: "Milk & Cream",
        x: 30,
        y: 60,
        width: 140,
        height: 80,
        items: ["Milk", "Cream"],
        inList: true
      },
      {
        id: "d2",
        name: "Cheese",
        x: 30,
        y: 160,
        width: 140,
        height: 80,
        items: ["Cheddar", "Mozzarella"],
        inList: false
      },
      {
        id: "d3",
        name: "Eggs & Butter",
        x: 30,
        y: 260,
        width: 140,
        height: 80,
        items: ["Eggs", "Butter"],
        inList: true
      },
    ]
  },
  {
    id: "produce",
    name: "Produce",
    color: "bg-green-50 dark:bg-green-900",
    borderColor: "border-green-200 dark:border-green-800",
    racks: [
      {
        id: "p1",
        name: "Fruits",
        x: 210,
        y: 60,
        width: 160,
        height: 80,
        items: ["Apples", "Bananas", "Oranges"],
        inList: true
      },
      {
        id: "p2",
        name: "Vegetables",
        x: 210,
        y: 160,
        width: 160,
        height: 80,
        items: ["Carrots", "Lettuce", "Tomatoes"],
        inList: false
      },
    ]
  },
  {
    id: "bakery",
    name: "Bakery",
    color: "bg-amber-50 dark:bg-amber-900",
    borderColor: "border-amber-200 dark:border-amber-800",
    racks: [
      {
        id: "b1",
        name: "Bread",
        x: 410,
        y: 60,
        width: 140,
        height: 80,
        items: ["Whole Wheat Bread"],
        inList: true
      },
      {
        id: "b2",
        name: "Pastries",
        x: 410,
        y: 160,
        width: 140,
        height: 80,
        items: ["Croissants", "Donuts"],
        inList: false
      },
    ]
  },
  {
    id: "meat",
    name: "Meat & Seafood",
    color: "bg-red-50 dark:bg-red-900",
    borderColor: "border-red-200 dark:border-red-800",
    racks: [
      {
        id: "m1",
        name: "Beef",
        x: 30,
        y: 380,
        width: 140,
        height: 80,
        items: ["Ground Beef"],
        inList: false
      },
      {
        id: "m2",
        name: "Poultry",
        x: 30,
        y: 480,
        width: 140,
        height: 80,
        items: ["Chicken Breast"],
        inList: true
      },
    ]
  },
  {
    id: "frozen",
    name: "Frozen Foods",
    color: "bg-cyan-50 dark:bg-cyan-900",
    borderColor: "border-cyan-200 dark:border-cyan-800",
    racks: [
      {
        id: "f1",
        name: "Frozen Meals",
        x: 210,
        y: 380,
        width: 160,
        height: 80,
        items: ["Frozen Pizza"],
        inList: false
      },
      {
        id: "f2",
        name: "Ice Cream",
        x: 210,
        y: 480,
        width: 160,
        height: 80,
        items: ["Vanilla Ice Cream"],
        inList: false
      },
    ]
  },
  {
    id: "snacks",
    name: "Snacks & Beverages",
    color: "bg-purple-50 dark:bg-purple-900",
    borderColor: "border-purple-200 dark:border-purple-800",
    racks: [
      {
        id: "s1",
        name: "Chips & Snacks",
        x: 410,
        y: 380,
        width: 140,
        height: 80,
        items: ["Potato Chips"],
        inList: false
      },
      {
        id: "s2",
        name: "Soda & Drinks",
        x: 410,
        y: 480,
        width: 140,
        height: 80,
        items: ["Cola", "Sparkling Water"],
        inList: true
      },
    ]
  },
  {
    id: "checkout",
    name: "Checkout",
    color: "bg-gray-100 dark:bg-gray-800",
    borderColor: "border-gray-300 dark:border-gray-700",
    racks: [
      {
        id: "c1",
        name: "Checkout",
        x: 240,
        y: 620,
        width: 120,
        height: 60,
        items: [],
        inList: false
      },
    ]
  }
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
  { x: 300, y: 700, section: "entrance", isStop: true },
  { x: 410, y: 480, item: "Sparkling Water", section: "snacks", rackId: "s2", isStop: true },
  { x: 410, y: 160, item: "Whole Wheat Bread", section: "bakery", rackId: "b1", isStop: true },
  { x: 280, y: 160, section: "aisle", isStop: false },
  { x: 210, y: 160, item: "Apples", section: "produce", rackId: "p1", isStop: true },
  { x: 210, y: 60, section: "produce", isStop: false },
  { x: 30, y: 60, section: "dairy", isStop: false },
  { x: 30, y: 260, item: "Eggs", section: "dairy", rackId: "d3", isStop: true },
  { x: 30, y: 480, item: "Chicken Breast", section: "meat", rackId: "m2", isStop: true },
  { x: 210, y: 480, section: "frozen", isStop: false },
  { x: 280, y: 480, section: "aisle", isStop: true },
  // { x: 280, y: 620, section: "checkout", isStop: true },
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

const getArrowRotation = (currentIndex: number) => {
  if (currentIndex >= ROUTE.length - 1) return 0;
  const currentPoint = ROUTE[currentIndex];
  const nextPoint = ROUTE[currentIndex + 1];
  const dx = nextPoint.x - currentPoint.x;
  const dy = nextPoint.y - currentPoint.y;
  return Math.atan2(dy, dx) * (180 / Math.PI);
};

export default function SmartBuyDemo() {
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(INITIAL_SHOPPING_LIST);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // New state for pause at stops
  const [timeSaved, setTimeSaved] = useState(0);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [assistanceRequested, setAssistanceRequested] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("entrance");
  const [showItemPopup, setShowItemPopup] = useState<{ item: string, section: string } | null>(null);
  const [highlightedRack, setHighlightedRack] = useState<string | null>(null);
  const [currentStop, setCurrentStop] = useState<number>(0); // Track current stop index

  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Get only stop points from the route
  const stopPoints = ROUTE.filter(point => point.isStop);
  const currentStopPoint = stopPoints[currentStop];
  const [pathLength, setPathLength] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (pathRef.current) {
      // Measure the actual path length
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
    }
  }, []);

  // Calculate progress for the path animation

  const progressMotion = useMotionValue(currentPosition / (ROUTE.length - 1));
  useEffect(() => {
    progressMotion.set(currentPosition / (ROUTE.length - 1));
  }, [currentPosition, progressMotion]);

  const pathProgress = useTransform(progressMotion, [0, 1], [0, 1]);

  // Animate the stroke-dashoffset based on progress
  const pathOffset = useTransform(
    pathProgress,
    [0, 1],
    [pathLength, 0]
  );
  // Simulate navigation through the store
  useEffect(() => {
    if (isNavigating && !isPaused && currentPosition < ROUTE.length - 1) {
      const timer = setTimeout(() => {
        const nextPosition = currentPosition + 1;
        setCurrentPosition(nextPosition);

        // Check if we've reached a stop point
        if (ROUTE[nextPosition].isStop) {
          setIsPaused(true);
          setCurrentStop(stopPoints.findIndex(point =>
            point.x === ROUTE[nextPosition].x &&
            point.y === ROUTE[nextPosition].y
          ));
        }

        // Update active section
        if (ROUTE[nextPosition].section) {
          setActiveSection(ROUTE[nextPosition].section!);
        }

        // Update highlighted rack
        if (ROUTE[nextPosition].rackId) {
          setHighlightedRack(ROUTE[nextPosition].rackId!);
        } else {
          setHighlightedRack(null);
        }

        // Check if we're at an item point
        const currentPoint = ROUTE[nextPosition];
        if (currentPoint.item) {
          // Show item popup
          setShowItemPopup({
            item: currentPoint.item,
            section: currentPoint.section || ""
          });

          // Hide popup after delay
          setTimeout(() => {
            setShowItemPopup(null);

            // Mark item as collected after popup
            setShoppingList(prev =>
              prev.map(item =>
                item.name === currentPoint.item ? { ...item, collected: true } : item
              )
            );

            // Show time saved notification
            setTimeSaved(prev => prev + 2);
            setTimeout(() => setTimeSaved(prev => prev - 2), 3000);
          }, 1500);
        }

        // Show recommendations at specific points
        if (nextPosition === 1) {
          setRecommendations([RECOMMENDATIONS[2]]); // Sparkling water
        } else if (nextPosition === 8) {
          setRecommendations([RECOMMENDATIONS[3]]); // Frozen berries
        }
      }, 1500);

      return () => clearTimeout(timer);
    } else if (isNavigating && currentPosition === ROUTE.length - 1) {
      setIsNavigating(false);
      setActiveSection("checkout");
      setHighlightedRack(null);
    }
  }, [isNavigating, currentPosition, isPaused]);

  const startNavigation = () => {
    setCurrentPosition(0);
    setCurrentStop(0);
    setShoppingList(INITIAL_SHOPPING_LIST);
    setRecommendations([]);
    setIsNavigating(true);
    setIsPaused(false);
    setActiveSection("entrance");
    setHighlightedRack(null);
  };

  const continueNavigation = () => {
    setIsPaused(false);
  };

  const addRecommendation = (rec: Recommendation) => {
    setShoppingList(prev => [...prev, {
      id: rec.id,
      name: rec.name,
      collected: false,
      section: rec.section,
      rackId: "" // Placeholder, not used in demo
    }]);
    setRecommendations(prev => prev.filter(r => r.id !== rec.id));
  };

  const requestAssistance = () => {
    setAssistanceRequested(true);
    setTimeout(() => setAssistanceRequested(false), 5000);
  };

  // Generate path for SVG route
  const generateRoutePath = (points: RoutePoint[], upToIndex: number) => {
    if (points.length === 0) return "";

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i <= upToIndex; i++) {
      path += ` L ${points[i].x - 20} ${points[i].y - 20}`;
    }
    return path;
  };

  // Calculate progress percentage
  const progress = (currentPosition / (ROUTE.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <motion.header
          className="mb-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary flex items-center">
              <span className="bg-primary text-primary-foreground rounded-lg px-3 py-1 mr-2">Walmart</span>
              SmartBuy+
            </h1>
            <p className="text-muted-foreground mt-2">Optimized Shopping Experience</p>
          </div>

          <motion.div
            className="mt-4 flex justify-center"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <span className="mr-2">⏱️</span>
              Estimated time saved: 15-20 minutes
            </Badge>
          </motion.div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar - Shopping list and controls */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-primary">Shopping List</CardTitle>
                    <Badge variant="secondary">
                      {shoppingList.filter(i => i.collected).length}/{shoppingList.length} collected
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="space-y-3">
                    {shoppingList.map((item) => (
                      <motion.li
                        key={item.id}
                        className="flex items-center bg-card p-3 rounded-lg border"
                        whileHover={{ scale: 1.01 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div className={`w-6 h-6 rounded-full border mr-3 flex items-center justify-center transition-all ${item.collected
                          ? 'bg-green-500 border-green-600'
                          : 'bg-background border-border'
                          }`}>
                          {item.collected && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-white text-xs"
                            >
                              ✓
                            </motion.span>
                          )}
                        </div>
                        <div className="flex-1">
                          <span className={item.collected ? 'line-through text-muted-foreground' : 'font-medium'}>
                            {item.name}
                          </span>
                          <div className="text-xs text-muted-foreground flex items-center">
                            <span className="mr-1">{SECTION_ICONS[item.section]}</span>
                            <span>{item.section.charAt(0).toUpperCase() + item.section.slice(1)}</span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </ul>

                  <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-3 sm:space-x-3 space-y-3 sm:space-y-0">
                    {!isNavigating ? (<Button
                      className="w-full"
                      onClick={startNavigation}
                      disabled={isNavigating}
                    >

                      <span className="mr-2">🚀</span>
                      Start Navigation

                    </Button>) :
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='w-full space-y-2'
                      >
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-sm text-muted-foreground text-center">
                          Currently at: {currentStopPoint?.section || "Stop"}
                        </motion.p>
                        {isPaused ? (<Button
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={continueNavigation}
                        >
                          <div className="flex items-center">
                            <span className="mr-2">👉</span>
                            Continue to Next Stop
                          </div>
                        </Button>) : <Button
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={() => setIsPaused(true)}
                        >
                          <span className="mr-2">⏸️</span>
                          Pause Navigation
                        </Button>}
                      </motion.div>
                    }
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={requestAssistance}
                      disabled={assistanceRequested}
                    >
                      {assistanceRequested ? (
                        <div className="flex items-center">
                          <motion.div
                            className="w-4 h-4 rounded-full bg-green-500 mr-2"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                          Help is coming!
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="mr-2">🛟</span>
                          Request Assistance
                        </div>
                      )}
                    </Button>
                  </div>

                  {timeSaved > 0 && (
                    <motion.div
                      className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg flex items-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <span className="mr-2">⏱️</span>
                      <span>Just saved {timeSaved} minutes with optimized route!</span>
                    </motion.div>
                  )}


                </CardContent>
              </Card>
            </motion.div>

            <AnimatePresence>
              {recommendations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Card>
                    <CardHeader className="border-b">
                      <CardTitle className="text-primary flex items-center">
                        <span className="mr-2">✨</span>
                        Recommendations Nearby
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <CardDescription className="mb-3">Items you might like based on your list</CardDescription>
                      <div className="space-y-4">
                        {recommendations.map(rec => (
                          <motion.div
                            key={rec.id}
                            className="flex items-center justify-between p-3 bg-card rounded-lg border"
                            whileHover={{ scale: 1.01 }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <div className="flex items-center">
                              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 mr-3" />
                              <div>
                                <p className="font-medium">{rec.name}</p>
                                <div className="text-xs text-muted-foreground flex items-center">
                                  <span className="mr-1">{SECTION_ICONS[rec.section]}</span>
                                  <span>Near {rec.section} • {rec.price}</span>
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => addRecommendation(rec)}
                            >
                              Add
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Main content - Store map */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader className="border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle>Store Navigation</CardTitle>
                    <Badge className="px-3 py-1" variant="secondary">
                      <span className="mr-2">📍</span>
                      {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="bg-card rounded-lg border p-4 overflow-auto">
                    <ScrollArea
                      ref={mapContainerRef}
                      className="relative bg-background rounded-lg h-[800px] w-full"
                      style={{ width: '600px', height: '750px' }}
                    >
                      {/* Store sections with proper spacing */}
                      {STORE_SECTIONS.map(section => {
                        const xs = section.racks.map(r => r.x);
                        const ys = section.racks.map(r => r.y);
                        const ws = section.racks.map(r => r.width + r.x);
                        const hs = section.racks.map(r => r.height + r.y);
                        const x = Math.min(...xs) - 8; const y = Math.min(...ys) - 8;
                        const width = Math.max(...ws) - x + 8;
                        const height = Math.max(...hs) - y + 8;
                        const listHeight = section.racks.reduce((sum, rack) => sum + rack.height, 0) + (section.racks.length - 1) * 8;
                        return <div
                          key={section.id}
                          className={`absolute border border-dashed rounded-lg ${section.borderColor} ${section.color}`}
                          style={{ left: x, top: y, width, height }}
                        >
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <Badge variant="outline" className="bg-background">
                              <span className="mr-1">{SECTION_ICONS[section.id]}</span>
                              {section.name}
                            </Badge>
                          </div>

                          <div
                            className='h-(--listHeight) w-full overflow-y-auto grid grid-cols-1 gap-2 p-2 mt-3 overflow-x-hidden'
                            style={{
                              "--listHeight": `${listHeight}px`,
                            } as React.CSSProperties}
                          >

                            {section.racks.map(rack => (
                              <motion.div
                                key={rack.id}
                                className={cn(
                                  `border rounded-md shadow-sm transition-all duration-300`,
                                  {
                                    'ring-2 ring-primary ring-offset-2 z-10 bg-card scale-101': highlightedRack === rack.id,
                                    'bg-card': highlightedRack !== rack.id,
                                    'border-primary': rack.inList,
                                    'border-border': !rack.inList,
                                  }
                                )}
                                // style={{
                                //   left: rack.x - (section.racks[0].x - 20),
                                //   top: rack.y - (section.racks[0].y - 40),
                                //   width: `${rack.width}px`,
                                //   height: `${rack.height}px`,
                                // }}
                                whileHover={{
                                  scale: 1.02,
                                  boxShadow: "0px 2px 8px rgba(0,0,0,0.1)"
                                }}
                              >
                                <div className="p-2 h-full flex flex-col">
                                  <div className="test-sm">
                                    <span className="text-xs font-medium truncate">{rack.name}</span>
                                  </div>
                                  <div className="flex-1 grid gap-1 text-sm">
                                    {rack.items.map((item, index) => (
                                      <div
                                        key={index}
                                        className={`text-[10px] p-1 rounded ${shoppingList.some(i => i.name === item && !i.collected)
                                          ? 'bg-primary/10 border border-primary/30'
                                          : 'bg-muted/10'
                                          }`}
                                      >
                                        {item}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      })}

                      {/* Aisles and pathways */}
                      {/* <div className="absolute top-[340px] left-0 right-0 h-1 bg-gradient-to-r from-transparent via-muted to-transparent"></div>
                      <div className="absolute top-[570px] left-0 right-0 h-1 bg-gradient-to-r from-transparent via-muted to-transparent"></div>
                      <div className="absolute left-[180px] top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-muted to-transparent"></div>
                      <div className="absolute left-[380px] top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-muted to-transparent"></div> */}
                      {/* generate Aisles and pathways */}
                      {/* // Replace the existing hardcoded pathways and dots with this code: */}

                      {/* Generated Pathways - Vertical Aisles */}
                      {[180, 380].map((xPos) => (
                        <div
                          key={`v-${xPos}`}
                          className="absolute w-1 bg-gradient-to-b from-transparent via-muted to-transparent"
                          style={{ left: `${xPos + 10}px`, top: 0, bottom: 0 }}
                        />
                      ))}

                      {/* Generated Pathways - Horizontal Aisles */}
                      {[340, 570].map((yPos) => (
                        <div
                          key={`h-${yPos}`}
                          className="absolute h-1 bg-gradient-to-r from-transparent via-muted to-transparent"
                          style={{ top: `${yPos + 10}px`, left: 0, right: 0 }}
                        />
                      ))}

                      {/* Pathway Corners */}
                      {[
                        { x: 180, y: 340 },
                        { x: 180, y: 570 },
                        { x: 380, y: 340 },
                        { x: 380, y: 570 }
                      ].map((corner, idx) => (
                        <div
                          key={`corner-${idx}`}
                          className="absolute w-3 h-3 bg-muted rounded-full"
                          style={{ left: `${corner.x + 5}px`, top: `${corner.y + 5}px` }}
                        />
                      ))}
                      {/* Route */}
                      {/* Route */}
                      <svg className="absolute inset-0 pointer-events-none w-full h-full">
                        {/* Full route (dashed) */}
                        <path
                          d={generateRoutePath(ROUTE, ROUTE.length - 1)}
                          fill="none"
                          stroke="var(--muted)"
                          strokeWidth="4"
                          strokeDasharray="6,6"
                        />

                        {/* Completed route (solid) */}
                        <motion.path
                          ref={pathRef}
                          d={generateRoutePath(ROUTE, ROUTE.length - 1)}
                          fill="none"
                          // stroke="var(--primary)/40"
                          className="stroke-yellow-200 z-50"
                          strokeWidth="4"
                          strokeDasharray={pathLength}
                          strokeDashoffset={pathOffset}
                          initial={{
                            strokeDasharray: pathLength,
                            strokeDashoffset: pathLength
                          }}
                        />

                        {/* Directional Arrow */}
                        {currentPosition > 0 && (
                          <motion.g
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            style={{
                              transformOrigin: "center",
                              transformBox: "fill-box",
                            }}
                          >
                            <motion.g
                              animate={{
                                x: ROUTE[currentPosition].x - 20,
                                y: ROUTE[currentPosition].y - 20,
                                rotate: getArrowRotation(currentPosition),
                              }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20
                              }}
                            >
                              <path
                                d="M -15 0 L 0 0 M 0 0 L -8 -8 M 0 0 L -8 8"
                                // stroke="var(--tertiary)"
                                className='stroke-primary z-100'
                                strokeWidth="3"
                                strokeLinecap="round"
                              />
                            </motion.g>
                          </motion.g>
                        )}
                      </svg>

                      {/* Current position */}
                      <motion.div
                        className="absolute w-10 h-10 bg-primary rounded-full border-2 border-background shadow-lg flex items-center justify-center text-primary-foreground text-xs z-20"
                        style={{
                          left: `${ROUTE[currentPosition].x - 40}px`,
                          top: `${ROUTE[currentPosition].y - 50}px`,
                        }}
                        animate={{
                          left: `${ROUTE[currentPosition].x - 40}px`,
                          top: `${ROUTE[currentPosition].y - 50}px`,
                        }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <motion.div
                          className="absolute inset-0 rounded-full bg-primary/50"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.7, 0]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatType: "loop"
                          }}
                        />
                        <span className="font-bold">You</span>
                      </motion.div>

                      {/* Stop markers */}
                      {stopPoints.map((point, index) => (
                        <div
                          key={index}
                          className="absolute w-6 h-6 rounded-full bg-yellow-400 border-2 border-background flex items-center justify-center text-xs font-bold z-10"
                          style={{
                            left: `${point.x - 12}px`,
                            top: `${point.y - 12}px`,
                          }}
                        >
                          {index + 1}
                        </div>
                      ))}

                      {/* Key locations */}
                      <div className="absolute top-[700px] left-[300px]">
                        <Badge variant="outline" className="bg-background">
                          <span className="mr-1">🚪</span> Entrance
                        </Badge>
                      </div>

                    </ScrollArea>

                    {/* Progress bar */}
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Route Progress</span>
                      <span className="text-primary font-medium">{Math.round(progress)}%</span>
                    </div>
                    <motion.div
                      className="h-2 bg-muted rounded-full overflow-hidden"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1.5 }}
                    >
                      <div className="h-full bg-primary rounded-full"></div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Item collection popup */}
            <AnimatePresence>
              {showItemPopup && (
                <motion.div
                  className="fixed inset-0 flex items-center justify-center z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="absolute inset-0 bg-black/30"></div>
                  <motion.div
                    className="relative bg-card rounded-lg p-6 shadow-lg max-w-sm border"
                    initial={{ scale: 0.8, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                  >
                    <div className="text-center">
                      <div className="text-5xl mb-4">{SECTION_ICONS[showItemPopup.section]}</div>
                      <h3 className="text-xl font-bold text-foreground mb-2">Item Collected!</h3>
                      <p className="text-2xl font-medium text-primary mb-4">{showItemPopup.item}</p>
                      <div className="text-sm text-muted-foreground">Added to your shopping cart</div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Benefits cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span className="mr-2">👍</span>
                      Customer Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start p-2 rounded-lg hover:bg-muted transition-colors">
                        <span className="text-green-500 text-xl mr-2">✓</span>
                        <div>
                          <p className="font-medium">Save time with optimized routes</p>
                          <p className="text-sm text-muted-foreground">No more wandering aisles searching for items</p>
                        </div>
                      </li>
                      <li className="flex items-start p-2 rounded-lg hover:bg-muted transition-colors">
                        <span className="text-green-500 text-xl mr-2">✓</span>
                        <div>
                          <p className="font-medium">Reduce decision fatigue</p>
                          <p className="text-sm text-muted-foreground">Smart suggestions help you focus on shopping</p>
                        </div>
                      </li>
                      <li className="flex items-start p-2 rounded-lg hover:bg-muted transition-colors">
                        <span className="text-green-500 text-xl mr-2">✓</span>
                        <div>
                          <p className="font-medium">Keep items fresh</p>
                          <p className="text-sm text-muted-foreground">Perishables collected at optimal times</p>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span className="mr-2">🏪</span>
                      Store Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start p-2 rounded-lg hover:bg-muted transition-colors">
                        <span className="text-green-500 text-xl mr-2">✓</span>
                        <div>
                          <p className="font-medium">Understand shopping patterns</p>
                          <p className="text-sm text-muted-foreground">Gain insights into customer behavior</p>
                        </div>
                      </li>
                      <li className="flex items-start p-2 rounded-lg hover:bg-muted transition-colors">
                        <span className="text-green-500 text-xl mr-2">✓</span>
                        <div>
                          <p className="font-medium">Increase sales with recommendations</p>
                          <p className="text-sm text-muted-foreground">Targeted suggestions boost revenue</p>
                        </div>
                      </li>
                      <li className="flex items-start p-2 rounded-lg hover:bg-muted transition-colors">
                        <span className="text-green-500 text-xl mr-2">✓</span>
                        <div>
                          <p className="font-medium">Optimize store layout</p>
                          <p className="text-sm text-muted-foreground">Data-driven decisions for better flow</p>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}