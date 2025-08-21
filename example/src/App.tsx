import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { useWeb3 } from "magic-wrapper-sdk";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import "./App.css";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import Timer from "./helpers/timer";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "./components/ui/input-otp";

export const STEP = {
  EMAIL: "EMAIL",
  OTP: "OTP",
  VERIFYING: "VERIFYING",
  SUCCESS: "SUCCESS",
} as const;

function App() {
  const {
    isLoggedMagic,
    loginMagic,
    verifyOTPMagic,
    isSendingOTP,
    isVerifyingOTP,
    setIsSendingOTP,
  } = useWeb3();
  //! STATES
  const [step, setStep] = useState<(typeof STEP)[keyof typeof STEP]>(
    STEP.EMAIL
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [otpValue, setOTPValue] = useState<string>("");
  const timer = useRef(new Timer());
  //! EFFECTS
  useEffect(() => {
    const verifyMagic = async () => {
      await verifyOTPMagic?.(otpValue);
    };
    if (step === STEP.OTP && otpValue.length === 6) {
      verifyMagic();
    }
  }, [otpValue]);

  //! FUNCTIONS
  const parseMagicError = useCallback((err: any): string => {
    const errMessage = (err?.message || "").toLowerCase();

    if (err?.code === -32602) return "INVALID EMAIL";
    if (err?.code === -32603) return "INTERNAL SERVER ERROR";

    if (errMessage.includes("invalid-email-otp")) return "INVALID OTP";
    if (errMessage.includes("expired-email-otp")) return "OTP EXPIRED";
    if (errMessage.includes("login-throttled")) return "LOGIN THROTTLED";

    return err?.message || "Unknown error";
  }, []);

  const errorHandler = useCallback((reason: any) => {
    // Input OTP exceed 3 times -> set to loading
    if (reason?.code === -32603) {
      timer.current.debounce(() => {
        setIsSendingOTP(false);
        setStep(STEP.EMAIL);
      }, 300);
    }
  }, []);

  const handleSubmitEmail = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      console.log("clicked");
      setErrorMsg(null);
      e.preventDefault();
      const email = (
        e.currentTarget.elements.namedItem("email") as HTMLInputElement
      )?.value;

      await loginMagic?.({
        email: email.trim().toLowerCase(),
        onSuccess: () => {
          setStep(STEP.OTP);
          setSubmitting(false);
        },
        onFail: () => {
          setSubmitting(false);
        },
        onOTPSent() {
          setStep(STEP.OTP);
        },
        onVerifyOTPFail() {
          setOTPValue("");
          setErrorMsg("INVALID OTP");
        },
        onDone() {
          toast("Success");
          setStep(STEP.SUCCESS);
        },
        onLoginThrottled() {
          setErrorMsg("LOGIN THROTTLED");
        },
        onExpiredEmailOTP() {
          setErrorMsg("OTP EXPIRED");
        },
        onError(reason) {
          errorHandler(reason);
          setErrorMsg(parseMagicError(reason));
        },
      });
    },
    [loginMagic, parseMagicError, errorHandler]
  );

  const renderSteps = () => {
    switch (step) {
      case STEP.EMAIL:
        return (
          <form onSubmit={handleSubmitEmail}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  disabled={isSubmitting || isSendingOTP}
                  className="border-2 p-2 rounded-md"
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || isSendingOTP}
                >
                  Login
                </Button>
              </div>
            </div>
          </form>
        );
      case STEP.OTP:
        return (
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <label htmlFor="otp">OTP</label>
                <InputOTP
                  autoFocus
                  onFocus={() => setErrorMsg(null)}
                  maxLength={6}
                  value={otpValue}
                  pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                  onChange={(v) => {
                    setOTPValue(v);
                  }}
                  disabled={isVerifyingOTP}
                >
                  <div className="mx-auto flex items-center justify-between gap-6">
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
              </div>
            </div>
          </form>
        );
      case STEP.VERIFYING:
        return <div>Loading...</div>;
    }
  };

  return (
    <div className="flex flex-row items-center justify-center h-screen">
      {/* <h1>This is a simple example for the magic-wrapper-sdk package</h1> */}
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>magic-wrapper-sdk example</CardTitle>
          <CardDescription>
            Enter your email to login and create a wallet with Magic.
            <div>
              Current status:
              <Badge variant={"destructive"} className="ml-2">
                {isLoggedMagic ? "Logged in" : "Not logged in"}
              </Badge>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>{renderSteps()}</CardContent>
      </Card>
    </div>
  );
}

export default App;
