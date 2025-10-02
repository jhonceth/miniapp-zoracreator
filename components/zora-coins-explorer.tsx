"use client"

import { useState, useRef, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CoinList } from "./coin-list"
import { FavoritesList } from "./favorites-list"
import { CreatorsList } from "./creators-list"
import { PriceMarquee } from "./price-marquee"
import { TrendingUp, BarChart3, Trophy, Heart, Users } from "lucide-react"

export function ZoraCoinsExplorer() {
  const [activeTab, setActiveTab] = useState("gainers")
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const tabs = ["gainers", "volume", "valuable", "creators", "favorites"]
  
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case "gainers": return "Top Gainers"
      case "volume": return "Top Volume"
      case "valuable": return "Most Valuable"
      case "creators": return "Creator Coin"
      case "favorites": return "Favorites"
      default: return ""
    }
  }

  // Swipe functionality
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = tabs.indexOf(activeTab)
      let nextIndex: number

      if (isLeftSwipe) {
        // Swipe left - go to next tab
        nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0
      } else {
        // Swipe right - go to previous tab
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1
      }

      setActiveTab(tabs[nextIndex])
    }
  }

  return (
    <div 
      ref={containerRef}
      className="w-full max-w-2xl mx-auto"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-0 z-0 bg-card-dark/95 backdrop-blur supports-[backdrop-filter]:bg-card-dark/60 border-b border-card-dark" style={{zIndex: 0}}>
          <PriceMarquee />

          <TooltipProvider>
            <TabsList className="w-full grid grid-cols-5 h-auto p-1 bg-card-dark/30 border-card-dark tab-active-blue" style={{zIndex: 0}}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="gainers"
                    className="flex flex-col items-center gap-1 py-3 text-secondary hover:text-accent-blue data-[state=active]:bg-accent-blue/10 data-[state=active]:text-accent-blue data-[state=active]:!text-accent-blue tab-hover-effect"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-medium hidden md:inline">Top Gainers</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="font-medium">Top Gainers</p>
                  <p className="text-xs text-muted-foreground">Coins with highest price increase</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="volume"
                    className="flex flex-col items-center gap-1 py-3 text-secondary hover:text-accent-blue data-[state=active]:bg-accent-blue/10 data-[state=active]:text-accent-blue data-[state=active]:!text-accent-blue tab-hover-effect"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-xs font-medium hidden md:inline">Top Volume</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="font-medium">Top Volume</p>
                  <p className="text-xs text-muted-foreground">Highest 24h trading volume</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="valuable"
                    className="flex flex-col items-center gap-1 py-3 text-secondary hover:text-accent-blue data-[state=active]:bg-accent-blue/10 data-[state=active]:text-accent-blue data-[state=active]:!text-accent-blue tab-hover-effect"
                  >
                    <Trophy className="w-4 h-4" />
                    <span className="text-xs font-medium hidden md:inline">Most Valuable</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="font-medium">Most Valuable</p>
                  <p className="text-xs text-muted-foreground">Highest market capitalization</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="creators"
                    className="flex flex-col items-center gap-1 py-3 text-secondary hover:text-accent-blue data-[state=active]:bg-accent-blue/10 data-[state=active]:text-accent-blue data-[state=active]:!text-accent-blue tab-hover-effect"
                  >
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-medium hidden md:inline">Creator Coin</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="font-medium">Creator Coin</p>
                  <p className="text-xs text-muted-foreground">Top creators by market cap</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="favorites"
                    className="flex flex-col items-center gap-1 py-3 text-secondary hover:text-accent-blue data-[state=active]:bg-accent-blue/10 data-[state=active]:text-accent-blue data-[state=active]:!text-accent-blue tab-hover-effect"
                  >
                    <Heart className="w-4 h-4" />
                    <span className="text-xs font-medium hidden md:inline">Favorites</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="font-medium">Favorites</p>
                  <p className="text-xs text-muted-foreground">Your saved favorite coins</p>
                </TooltipContent>
              </Tooltip>
            </TabsList>
          </TooltipProvider>
        </div>

        {/* Tab Title Display */}
        <div className="px-4 py-1 border-b border-card-dark">
          <h2 className="text-sm font-medium text-secondary text-center">
            {getTabTitle(activeTab)}
          </h2>
        </div>

        <div className="mt-4 tab-content-transition">
          <TabsContent value="gainers" className="mt-0">
            <CoinList type="TOP_GAINERS" />
          </TabsContent>
          <TabsContent value="volume" className="mt-0">
            <CoinList type="TOP_VOLUME_24H" />
          </TabsContent>
          <TabsContent value="valuable" className="mt-0">
            <CoinList type="MOST_VALUABLE" />
          </TabsContent>
          <TabsContent value="creators" className="mt-0">
            <CreatorsList />
          </TabsContent>
          <TabsContent value="favorites" className="mt-0">
            <FavoritesList />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
