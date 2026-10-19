import { SessionProvider, useSession } from "@/context/ctx";
import { SplashScreenController } from "@/context/splash";
import { Stack } from "expo-router";


export default function RootLayout() {
  return (
    <SessionProvider>
      <SplashScreenController/>
      <RootNavigator />
    </SessionProvider>
  );
}

function RootNavigator() {
  const { session } = useSession();
  return (
    <Stack 
        screenOptions={{ 
          headerStyle: {
            backgroundColor: "#219EBC"
          },
          headerTintColor: "#FFFFFF"
        }}
      >
        <Stack.Protected guard={!session}>
          <Stack.Screen name="Login" options={{title: "Login", headerTitleAlign: "center"}}/>
          <Stack.Screen name="Register" options={{title: "Cadastrar", headerTitleAlign: "center"}}/>
        </Stack.Protected>

        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(app)" options={{headerShown: false}}/>
        </Stack.Protected>
      </Stack>
  )
}