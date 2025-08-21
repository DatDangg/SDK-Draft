import { Button } from "../ui/button";

interface StepEmailProps {
  handleSubmitEmail: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isSubmitting: boolean;
  isSendingOTP: boolean;
}
export default function StepEmail({
  handleSubmitEmail,
  isSubmitting,
  isSendingOTP,
}: StepEmailProps) {
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
}
