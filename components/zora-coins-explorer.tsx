"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CoinList } from "./coin-list"
import { FavoritesList } from "./favorites-list"
import { CreatorsList } from "./creators-list"
import { PriceMarquee } from "./price-marquee"
import { TrendingUp, BarChart3, Trophy, Heart, Users } from "lucide-react"

export function ZoraCoinsExplorer() {
  const [activeTab, setActiveTab] = useState("gainers")

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <PriceMarquee />

          <TooltipProvider>
            <TabsList className="w-full grid grid-cols-5 h-auto p-1 bg-muted/50">
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger
                    value="gainers"
                    className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-background tab-hover-effect"
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
                    className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-background tab-hover-effect"
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
                    className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-background tab-hover-effect"
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
                    className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-background tab-hover-effect"
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
                    className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-background tab-hover-effect"
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

        <div className="mt-4">
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
