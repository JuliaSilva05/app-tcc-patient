import { useSession } from "@/context/ctx";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View, Text } from "react-native";
import Accordion from "react-native-collapsible/Accordion";
import { SafeAreaView } from "react-native-safe-area-context";
import Moment from 'moment';

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
  submitted: {
    label: "Esperando correção",
    color: "#34C759",
  },
  done: {
    label: "Feito",
    color: "#000000",
  },
  not_done: {
    label: "Refazer",
    color: "#FF383C",
  },
};

export default function ActivitiesList({activities}:{activities: any[]}) {
  const { user } = useSession();
  //@ts-ignore
  const user_id = JSON.parse(user)._id;

  return (
    <SafeAreaView>
      {activities.map(item => {
        const statusInfo = STATUSES[`${item.status}`];
        return (
          <>
            <Pressable 
              key={item._id}
              className="flex flex-row mx-2 items-center justify-between border-t border-t-neutral-400"
              onPress={() => {
                
                router.navigate({
                  pathname: "/(app)/Activities/Activity",
                  params: {
                    assignmentId: item._id,
                    patientId: user_id,
                    activityId: item.activity,
                    questionsCount: item.questionsCount,
                  }
                });

              }}
            >
              <View className="flex-1 flex-row items-center gap-3 my-3">
                <View className="w-10 h-10 p-1 items-center justify-center rounded-full border">
                  <MaterialIcons name="person" size={25} />
                </View>
                
                <View className="gap-0">
                  <Text className="text-lg truncate">{item.title}</Text>
                  <View className="flex-1 flex-row justify-between">
                    <Text className="text-sm">
                      <Text className="font-medium">Enviado por: </Text>{item.therapistDisplayName}
                    </Text> 
                    
                  </View>
                  <View className="flex-1 flex-row justify-between">
                    <Text className="text-sm">
                      <Text className="font-medium">Status: </Text>{statusInfo.label}
                    </Text> 
                    
                  </View>
                </View>
              </View>
            
              <View className="items-end">
                <MaterialIcons name="chevron-right" size={30} />
                <Text className="text-sm">
                  {Moment(item.createdAt).format("DD/MM/YYYY")}
                </Text> 
              </View>
            </Pressable>
          </>
        )
      })}
      
    </SafeAreaView>
  )
}