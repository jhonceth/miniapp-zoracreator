"use client";

import { useState, useEffect } from "react";
import { useAccount, useSimulateContract, useContractWrite } from "wagmi";
import { updatePayoutRecipientCall } from "@zoralabs/coins-sdk";
import { Address } from "viem";

export interface UpdatePayoutRecipientParams {
  coin: Address;
  newPayoutRecipient: Address;
}

export function useUpdatePayoutRecipient() {
  const { address } = useAccount();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentParams, setCurrentParams] = useState<UpdatePayoutRecipientParams | null>(null);

  // Generar configuración del contrato
  const contractCallParams = currentParams ? updatePayoutRecipientCall(currentParams) : null;

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

  const updatePayoutRecipient = async (params: UpdatePayoutRecipientParams) => {
    if (!address) {
      setError("No hay wallet conectada");
      return;
    }

    setIsUpdating(true);
    setError(null);
    setSuccess(false);

    try {
      console.log("🔄 Actualizando receptor de pagos:", params);

      // Validar que la dirección sea válida
      if (!params.newPayoutRecipient.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error("Dirección de receptor inválida");
      }

      // Establecer parámetros para generar la configuración
      setCurrentParams(params);

      console.log("📋 Parámetros establecidos, esperando configuración...");

    } catch (err) {
      console.error("❌ Error actualizando receptor:", err);
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
    updatePayoutRecipient,
    isUpdating: isUpdating || isPending || isSimulating,
    error: error || simulateError?.message || writeError?.message,
    success,
    hash,
    reset,
  };
}