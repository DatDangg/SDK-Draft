import "./App.css";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { useWeb3 } from "magic-wrapper-sdk";

function App() {
  const { isLoggedMagic } = useWeb3();
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
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="border-2 p-2 rounded-md"
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full">
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default App;
