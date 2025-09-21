"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Rocket,
    title: "Launch Tokens",
    description: "Create custom tokens on Base using Zora Protocol",
    color: "text-purple-600",
    bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
    borderColor: "border-purple-200"
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Built on Base network with Zora Protocol security",
    color: "text-blue-600",
    bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
    borderColor: "border-blue-200"
  },
  {
    icon: Zap,
    title: "Farcaster Native",
    description: "Seamlessly integrated with Farcaster Mini Apps",
    color: "text-green-600",
    bgColor: "bg-gradient-to-br from-green-50 to-green-100",
    borderColor: "border-green-200"
  }
];

export function FeatureCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % features.length);
    }, 3000); // Cambia cada 3 segundos

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const currentFeature = features[currentIndex];
  const Icon = currentFeature.icon;

  return (
    <div className="w-full">
      {/* Main Card */}
      <Card className={`text-center transition-all duration-500 ${currentFeature.bgColor} ${currentFeature.borderColor} border-2 shadow-lg hover:shadow-xl`}>
        <CardContent className="pt-8 pb-8 px-6">
          <div className="relative">
            <Icon className={`w-12 h-12 sm:w-16 sm:h-16 ${currentFeature.color} mx-auto mb-4 transition-all duration-500 drop-shadow-sm`} />
            <div className={`absolute -top-2 -right-2 w-6 h-6 ${currentFeature.bgColor} rounded-full border-2 ${currentFeature.borderColor} flex items-center justify-center`}>
              <div className={`w-2 h-2 ${currentFeature.color.replace('text-', 'bg-')} rounded-full`}></div>
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 transition-all duration-500">
            {currentFeature.title}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 transition-all duration-500 leading-relaxed">
            {currentFeature.description}
          </p>
        </CardContent>
      </Card>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-3 mt-6">
        {features.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-purple-600 scale-125 shadow-lg"
                : "bg-gray-300 hover:bg-gray-400 hover:scale-110"
            }`}
            aria-label={`Go to ${features[index].title}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mt-4 overflow-hidden">
        <div
          className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300 ease-linear shadow-sm"
          style={{
            width: `${((currentIndex + 1) / features.length) * 100}%`
          }}
        />
      </div>
    </div>
  );
}
