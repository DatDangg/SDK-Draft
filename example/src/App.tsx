import { useWeb3 } from "magic-wrapper-sdk";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import "./App.css";
import { Badge } from "./components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import Timer from "./helpers/timer";

import StepEmail from "./components/steps/StepEmail";
import StepOTP from "./components/steps/StepOTP";
import StepSuccess from "./components/steps/StepSuccess";

export const STEP = {
  EMAIL: "EMAIL",
  OTP: "OTP",
  VERIFYING: "VERIFYING",
  SUCCESS: "SUCCESS",
} as const;

function App() {
  const {
    magic,
    isLoggedMagic,
    loginMagic,
    verifyOTPMagic,
    isSendingOTP,
    isVerifyingOTP,
    setIsSendingOTP,
    disconnectWallet,
  } = useWeb3();
  //! STATES
  const [step, setStep] = useState<(typeof STEP)[keyof typeof STEP]>(
    STEP.EMAIL
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [otpValue, setOTPValue] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string>("");
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

  useEffect(() => {
    const getWalletAddress = async () => {
      const address = await magic?.user
        .getInfo()
        .then((info) => info?.publicAddress);
      console.log(address);
      setWalletAddress(String(address));
    };
    if (isLoggedMagic) {
      getWalletAddress();
      setStep(STEP.SUCCESS);
    }
  }, [isLoggedMagic]);

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
        setOTPValue("");
        setIsSendingOTP(false);
        setStep(STEP.EMAIL);
        toast.warning("Maximum attempts exceeded. Please try again.");
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
          setOTPValue("");
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
          <StepEmail
            handleSubmitEmail={handleSubmitEmail}
            isSendingOTP={isSendingOTP}
            isSubmitting={isSubmitting}
          />
        );
      case STEP.OTP:
        return (
          <StepOTP
            isVerifyingOTP={isVerifyingOTP}
            errorMsg={errorMsg}
            otpValue={otpValue}
            setOTPValue={setOTPValue}
          />
        );
      case STEP.VERIFYING:
        return <div>Loading...</div>;
      case STEP.SUCCESS:
        return (
          <StepSuccess
            walletAddress={walletAddress}
            disconnectWallet={disconnectWallet}
            setStep={setStep}
          />
        );
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
              <Badge
                variant={isLoggedMagic ? "success" : "destructive"}
                className="ml-2"
              >
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
