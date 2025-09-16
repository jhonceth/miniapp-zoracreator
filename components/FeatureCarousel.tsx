"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Rocket,
    title: "Crear Tokens",
    description: "Tokens personalizados en Base con Protocolo Zora",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  {
    icon: Shield,
    title: "Seguro",
    description: "Construido en Base con Protocolo Zora",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  {
    icon: Zap,
    title: "Farcaster",
    description: "Integrado con Farcaster Mini Apps",
    color: "text-green-600",
    bgColor: "bg-green-50",
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
      <Card className={`text-center transition-all duration-500 ${currentFeature.bgColor} ${currentFeature.borderColor}`}>
        <CardContent className="pt-6 pb-6">
          <Icon className={`w-8 h-8 sm:w-12 sm:h-12 ${currentFeature.color} mx-auto mb-3 transition-all duration-500`} />
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 transition-all duration-500">
            {currentFeature.title}
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground transition-all duration-500">
            {currentFeature.description}
          </p>
        </CardContent>
      </Card>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {features.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-purple-600 scale-125"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Ir a ${features[index].title}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-1 mt-3">
        <div
          className="bg-gradient-to-r from-purple-600 to-blue-600 h-1 rounded-full transition-all duration-300 ease-linear"
          style={{
            width: `${((currentIndex + 1) / features.length) * 100}%`
          }}
        />
      </div>
    </div>
  );
}
