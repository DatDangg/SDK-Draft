import { STEP } from "@/App";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../ui/alert-dialog";

interface StepSuccessProps {
  walletAddress: string;
  disconnectWallet: () => void;
  setStep: (step: (typeof STEP)[keyof typeof STEP]) => void;
}

export default function StepSuccess({
  walletAddress,
  disconnectWallet,
  setStep,
}: StepSuccessProps) {
  return (
    <div className="w-full grid items-center gap-2">
      <div>
        <label htmlFor="walletAddress">Wallet Address</label>
        <input
          id="walletAddress"
          type="email"
          placeholder="Your wallet address will be displayed here"
          disabled
          value={walletAddress}
          className="border-2 p-2 rounded-md w-full"
        />
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant={"destructive"}>Disconnect Wallet</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Wallet</AlertDialogTitle>
            <AlertDialogDescription>
              This will disconnect your wallet and reset the steps.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                disconnectWallet(), setStep(STEP.EMAIL);
              }}
            >
              Disconnect
            </AlertDialogAction>

            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
