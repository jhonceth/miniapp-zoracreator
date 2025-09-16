"use client";

import { useState, useEffect } from "react";
import { useAccount, useSimulateContract, useContractWrite } from "wagmi";
import { updateCoinURICall } from "@zoralabs/coins-sdk";
import { Address } from "viem";

export interface UpdateURIParams {
  coin: Address;
  newURI: string;
}

export function useUpdateCoinURI() {
  const { address } = useAccount();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentParams, setCurrentParams] = useState<UpdateURIParams | null>(null);

  // Generar configuración del contrato
  const contractCallParams = currentParams ? updateCoinURICall(currentParams) : null;

  // Simular la transacción
  const { data: config, error: simulateError, isLoading: isSimulating } = useSimulateContract({
    ...contractCallParams,
    query: {
      enabled: !!contractCallParams && !!address,
    },
  });

  // Escribir el contrato
  const { 
    data: hash, 
    isPending, 
    error: writeError, 
    writeContract,
    reset: resetWriteContract 
  } = useContractWrite();

  const updateURI = async (params: UpdateURIParams) => {
    if (!address) {
      setError("No hay wallet conectada");
      return;
    }

    setIsUpdating(true);
    setError(null);
    setSuccess(false);

    try {
      console.log("🔄 Actualizando URI del token:", params);

      // Validar que la URI sea válida según la documentación de Zora
      if (!params.newURI.startsWith("ipfs://") && !params.newURI.startsWith("https://")) {
        throw new Error("La URI debe comenzar con 'ipfs://' o 'https://'");
      }

      // Establecer parámetros para generar la configuración
      setCurrentParams(params);

      console.log("📋 Parámetros establecidos, esperando configuración...");

    } catch (err) {
      console.error("❌ Error actualizando URI:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      setIsUpdating(false);
    }
  };

  // Ejecutar la transacción cuando tengamos la configuración
  useEffect(() => {
    if (config && currentParams && isUpdating && !isSimulating) {
      console.log("✅ Configuración lista, ejecutando transacción...");
      writeContract(config.request);
    }
  }, [config, currentParams, isUpdating, isSimulating, writeContract]);

  // Manejar éxito cuando se confirma la transacción
  useEffect(() => {
    if (hash && !success) {
      setSuccess(true);
      setIsUpdating(false);
      console.log("🎉 Transacción confirmada:", hash);
    }
  }, [hash, success]);

  // Manejar errores de simulación
  useEffect(() => {
    if (simulateError && currentParams) {
      console.error("❌ Error en simulación:", simulateError);
      setError(simulateError.message || "Error en la simulación de la transacción");
      setIsUpdating(false);
    }
  }, [simulateError, currentParams]);

  // Manejar errores de escritura
  useEffect(() => {
    if (writeError) {
      console.error("❌ Error en escritura:", writeError);
      setError(writeError.message || "Error ejecutando la transacción");
      setIsUpdating(false);
    }
  }, [writeError]);

  const reset = () => {
    setError(null);
    setSuccess(false);
    setCurrentParams(null);
    resetWriteContract();
  };

  return {
    updateURI,
    isUpdating: isUpdating || isPending || isSimulating,
    error: error || simulateError?.message || writeError?.message,
    success,
    hash,
    reset,
  };
}