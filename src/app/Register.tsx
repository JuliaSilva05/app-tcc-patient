import MaterialIcons from "@react-native-vector-icons/material-icons";
import { Link, router, Stack, useNavigation, useRouter } from "expo-router";
import { useContext, useState } from "react";
import { View, Text, TextInput, Button, Pressable, Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosInstance from "@/services/apiConfig";
import { useSession } from "@/context/ctx";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useSession();

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      const { data } = await axiosInstance.post("/api/register", {
        name,
        email,
        password,
        role: "patient",
      });

      console.log('data', data)

      if (data.error) {
        Alert.alert(data.error);
      } else {
        signIn(data);
        Alert.alert("Conta cadastrada com sucesso");
        router.replace("/(app)");
      };
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white p-4">      
      <KeyboardAwareScrollView
        contentContainerClassName="flex-1 items-center justify-evenly"
      >
        <View className="flex w-full gap-6">

          <View className="gap-1">
            <Text className="text-base text-neutral-400 font-medium">
              NOME
              <Text className="text-red-500"> *</Text>
            </Text>
            <TextInput
              placeholder="Escreva seu nome..."
              className="text-base bg-neutral-200 shadow-md border-b-2 border-neutral-400 
                rounded-t-md p-1"
              autoCapitalize="words"
              onChangeText={(e) => setName(e)}
              editable={!isLoading}
            />
          </View>

          <View className="gap-1">
            <Text className="text-base text-neutral-400 font-medium">
              E-MAIL
              <Text className="text-red-500"> *</Text>
            </Text>
            <TextInput
              placeholder="Escreva seu e-mail..."
              className="text-base bg-neutral-200 shadow-md border-b-2 border-neutral-400 
                rounded-t-md p-1"
                keyboardType="email-address"
              onChangeText={(e) => setEmail(e)}
              editable={!isLoading}
            />
          </View>
          
          <View className="gap-1">
            <Text className="text-base text-neutral-400 font-medium">
              SENHA
              <Text className="text-red-500"> *</Text>
            </Text>
            <View className="relative justify-around">
              <TextInput
                placeholder="Escreva sua senha..."
                className="text-base bg-neutral-200 shadow-md border-b-2 border-neutral-400 
                  rounded-t-md p-1"
                secureTextEntry={!showPassword}
                onChangeText={(e) => setPassword(e)}
                editable={!isLoading}
              />
              <Pressable className="absolute right-2" onPress={() => setShowPassword(!showPassword)}>
                <MaterialIcons 
                  name={showPassword ? "visibility" : "visibility-off"} 
                  color={"#b0afaf"} size={20} 
                />
              </Pressable>
            </View>
          </View>
        </View>
        
        <Pressable
          className="border-[2px] border-sky-900 rounded-[32px] px-12 py-4 bg-sky-300" 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text className="text-xl text-sky-900 font-medium">CADASTRAR</Text>
        </Pressable>

      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

export default Register;