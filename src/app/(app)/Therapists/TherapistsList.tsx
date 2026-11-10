import MaterialIcons from "@react-native-vector-icons/material-icons";
import { router, usePathname } from "expo-router";
import { View, Text, Pressable, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import { Collapsible } from "../../../../example/src/components/ui/collapsible";
import { Host, Collapsible, } from '@expo/ui';
import { useState } from "react";
import { Divider } from "react-native-elements";
import axiosInstance from "@/services/apiConfig";
import { useSession } from "@/context/ctx";
const mock = [
  {
    _id: "1",
    therapistDisplayName: "asdfasfsa",
    therapistEmail: "asdfasfsa",
    status:"pending",
  },
  {
    _id: "2",
    therapistDisplayName: "lolopkllihl",
    therapistEmail: "asdfasfsa",
    status:"archived",
  },
  {
    _id: "3",
    therapistDisplayName: "wwwwwwww",
    therapistEmail: "asdfasfsa",
    status:"pending",
  },
  {
    _id: "4",
    therapistDisplayName: "ccccccc",
    therapistEmail: "asdfasfsa",
    status:"rejected",
  },
  {
    _id: "5",
    therapistDisplayName: "bbbbbbbbbbbbb",
    therapistEmail: "asdfasfsa",
    status:"active",
  },
]
type Therapists = {
  _id: string;
  therapist: string;
  therapistDisplayName: string;
  therapistEmail: string;
  status: string;
}

interface Statuses {
  [key: string]: {
    label: string;
    color: string;
  }
}

const STATUSES: Statuses = {
  pending: {
    label: "Pendente",
    color: "#FF8D28",
  },
  active: {
    label: "Ativo",
    color: "#34C759",
  },
  archived: {
    label: "Arquivado",
    color: "#000000",
  },
  rejected: {
    label: "Rejeitado",
    color: "#FF383C",
  },
};

export default function TherapistsList({therapists}:{therapists: Therapists[]}) {
  const location = usePathname();
  const { user } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleResponse = async (option: string, linkId: string) => {
    try {
      setIsLoading(true);
      //@ts-ignore
      const patient = JSON.parse(user)._id;

      const { data } = await axiosInstance.patch("api/edit-care-link", {
        newStatus: option,
        linkId,
      });

      if (data.ok) {
        Alert.alert(`Terapeuta ${option === "rejected" ? "rejeitado" : "aceito"} com sucesso!`);
      } else {
        Alert.alert("Algo deu errado. Tente novamente.")
      }

    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView>
      {therapists.map(item => {
        const statusInfo = STATUSES[`${item.status}`];
        
        const [isOpen, setIsOpen] = useState(false);

        return (
          <>
            <Pressable 
              key={item._id}
              className="flex flex-row mx-2 items-center justify-between border-t border-t-neutral-400"
              onPress={() => {
                if (item.status === "active" || item.status === "archived") {
                  // router.navigate("/Therapists/TherapistProfile");
                } else if (item.status === "pending") {
                  setIsOpen(!isOpen);
                }
              }}
            >
                <View className="flex-1 flex-row items-center gap-3 my-3">
                  <View className="w-10 h-10 p-1 items-center justify-center rounded-full border">
                    <MaterialIcons name="person" size={25} />
                  </View>
                  
                  <View className="gap-0">
                    <Text className="text-lg truncate">{item.therapistDisplayName}</Text>
                    <Text className={`text-sm`} style={{color: statusInfo.color}}>
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>
              
              {item.status === "active" || item.status === "archived" ? 
                <MaterialIcons name="chevron-right" size={30} /> 
              : item.status === "pending" ? (
                <MaterialIcons name="info-outline" size={30} />
              ) : null}

            </Pressable>

            <Modal
              animationType="slide"
              transparent
              visible={isOpen}
              onRequestClose={() => {setIsOpen(false)}}
            >
              <Pressable onPress={() => setIsOpen(false)}
                className="flex-1 justify-center items-center p-6 bg-[rgba(0,0,0,0.5)]"  
              >
                <Pressable className="w-full bg-white p-5 gap-3 rounded-lg">
                  <Pressable className="absolute top-3 right-3 z-1" onPress={() => setIsOpen(false)}>
                    <MaterialIcons name="close" size={24} />
                  </Pressable>
                  <Text className="text-xl font-medium ">Pedido de Conexão</Text>

                  <Divider />
                  
                  <Text>
                    {item.therapistDisplayName} quer se conectar com você.
                  </Text>

                  <View className="flex flex-col mb-1">
                    <Text className="text-md">
                      <Text className="font-medium">
                        Nome:{" "}
                      </Text>
                      {item.therapistDisplayName}
                    </Text>
                    <Text className="text-md">
                      <Text className="font-medium">
                        E-mail:{" "}
                      </Text>
                      {item.therapistEmail}
                    </Text>
                  </View>

                  <View className="flex flex-row">
                    <Pressable
                      className="w-1/2 items-center p-3 border border-red-600 bg-white rounded-lg"
                      onPress={() => handleResponse("rejected", item._id)}
                    >
                      <Text className="text-red-600 font-medium">Rejeitar</Text>
                    </Pressable>
                    <Pressable
                      className="w-1/2 items-center p-3 bg-green-600 rounded-lg"
                      onPress={() => handleResponse("active", item._id)}
                    >
                      <Text className="text-white font-medium">Aceitar</Text>
                    </Pressable>
                  </View>
                </Pressable>
              </Pressable>
            </Modal>
          </>
        )
      })}
    </SafeAreaView>
  )
}