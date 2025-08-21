import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

import Loading from "../ui/loading";

interface StepOTPProps {
  isVerifyingOTP: boolean;
  errorMsg: string | null;
  otpValue: string;
  setOTPValue: (value: string) => void;
}
export default function StepOTP({
  isVerifyingOTP,
  errorMsg,
  otpValue,
  setOTPValue,
}: StepOTPProps) {
  return (
    <form>
      <div className="flex flex-col gap-6">
        <div className="grid gap-2 relative">
          <label htmlFor="otp">OTP</label>
          <p className="text-md text-destructive text-center">{errorMsg}</p>

          {isVerifyingOTP ? (
            <div
              role="status"
              className="flex w-full items-center justify-center gap-2 h-[44px] top-0 left-0"
            >
              <Loading className="h-[12px] w-[12px]" />
              <p className="text-sm text-zinc-600">Verifying OTP...</p>
            </div>
          ) : (
            <InputOTP
              autoFocus
              maxLength={6}
              value={otpValue}
              pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
              onChange={(v) => setOTPValue(v)}
            >
              <div className="mx-auto w-full flex items-center justify-between">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <InputOTPGroup key={idx}>
                    <InputOTPSlot
                      index={idx}
                      className="h-[44px] w-[44px] text-[20px]"
                      autoFocus={idx === 0}
                    />
                  </InputOTPGroup>
                ))}
              </div>
            </InputOTP>
          )}
        </div>
      </div>
    </form>
  );
}
