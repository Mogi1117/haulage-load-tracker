//import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useRef } from 'react';
import 'react-native-reanimated';
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

//import { useColorScheme } from '@/hooks/useColorScheme';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback, Alert, ActivityIndicator,BackHandler,AppState } from "react-native";

import DropdownComponent from "../components/Selector";

//api
import { 
  ApisUrl, 
  asyncStorageKey,
  asyncStorageLastSubmitKey, 
  asyncStorageDrivers, 
  asyncStorageTrucks, 
  asyncStorageConfigs, 
  asyncStoragePits, 
  asyncStorageLoaders 
} from "../utils/Constants";
import {
  getDrivers,
  getTrucks,
  getConfigurations,
  getPits,
  getLoaders,
  submitFormData,
} from "../utils/ApiManager";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [submitData, setSubmitData] = useState<ISubmitData>({operatorName:'', truckName:'', configurationName:'',pit:'', loader:'',comments:''});
  const [drivers, setDrivers]= useState([]);
  const [trucks, setTrucks]= useState([]);
  const [configs, setConfigs]= useState([]);
  const [pits, setPits]= useState([]);
  const [loaders, setLoaders]= useState([]);  
  const [isConnected, setConnected] = useState(false);   
  const [isSubmitting, setSubmitting] = useState(false);      

  const delay = () => new Promise((resolve) => setTimeout(resolve, 500));

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        getLastSubmitedData();        
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    // Initially check the connection status      
    NetInfo.fetch().then((state) => {   
      setConnected(state.isInternetReachable?true:false);         
    });    

    // Subscribe to connectivity change
    const unsubscribe = NetInfo.addEventListener((state) => {
      setConnected(state.isInternetReachable?true:false);      
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(()=>{
    if(isConnected){
      (async ()=>{
        //Internet connection restored, loading saved data...
        const storedData = await AsyncStorage.getItem(asyncStorageKey);
        const storedDataArray = storedData ? JSON.parse(storedData) : [];
        const len = storedDataArray.length;

        for(let i = 0;i<len;i++){
          setSubmitting(true);
          await delay();
          var item = storedDataArray[0];
          try {
            await submitFormData(
              "POST",
              ApisUrl.formSubmit,
              item
            );            
            storedDataArray.shift(); 
          } catch (error) {
            
          }          
        }
        
        await AsyncStorage.setItem(asyncStorageKey, JSON.stringify(storedDataArray))
        setSubmitting(false);

      })();      
    }
  }, [isConnected]);

  const handleFormChange = (field: string, value: any) => {
    setSubmitData({
      ...submitData,
      [field]:value
    });    
  };

  const getDriverNames = async () => {
    let driverNames:any = [];    
    if(isConnected){
      const data = await getDrivers("GET", ApisUrl.drivers);    
      if (data) {      
        data?.map((item:any)=>{
          driverNames.push(
            {
              label: item,
              value: item
            }
          );
        });
        
        await AsyncStorage.setItem(asyncStorageDrivers, JSON.stringify(driverNames));
      }
    }else{
      const storedDrivers = await AsyncStorage.getItem(asyncStorageDrivers);
      driverNames = storedDrivers ? JSON.parse(storedDrivers) : [];
    }    

    setDrivers(driverNames);
  };

  const getTruckNames = async () => {
    let trucksNames:any = [];
    if(isConnected){
      const data = await getTrucks("GET", ApisUrl.trucks);    
      if (data) {      
        data?.map((item:any)=>{
          trucksNames.push(
            {
              label: item,
              value: item
            }
          );
        });
        await AsyncStorage.setItem(asyncStorageTrucks, JSON.stringify(trucksNames));
      }          
    }else{
      const storedTrucks = await AsyncStorage.getItem(asyncStorageTrucks);
      trucksNames = storedTrucks ? JSON.parse(storedTrucks) : [];
    }
    setTrucks(trucksNames)      
  };

  const getConfigurationNames = async () => {
    let configurations:any = [];
    if(isConnected){
      const data = await getConfigurations("GET", ApisUrl.configurations);    
      if (data) {      
        data?.map((item:any)=>{
          configurations.push(
            {
              label: item,
              value: item
            }
          );
        });        
        await AsyncStorage.setItem(asyncStorageConfigs, JSON.stringify(configurations));
      }
    }else{
      const storedConfigs = await AsyncStorage.getItem(asyncStorageConfigs);
      configurations = storedConfigs ? JSON.parse(storedConfigs) : [];
    }    
    setConfigs(configurations);
  };

  const getPitNames = async () => {
    let pitNames:any = [];
    if(isConnected){
      const data = await getPits("GET", ApisUrl.pits);    
      if (data) {        
        data?.map((item:any)=>{
          pitNames.push(
            {
              label: item,
              value: item
            }
          );
        });  
        await AsyncStorage.setItem(asyncStoragePits, JSON.stringify(pitNames));      
      }
    }else{
      const storedPits = await AsyncStorage.getItem(asyncStoragePits);
      pitNames = storedPits ? JSON.parse(storedPits) : [];
    }    
    setPits(pitNames);
  };

  const getLoaderNames = async () => {
    let loaderNames:any = [];
    if(isConnected){
      const data = await getLoaders("GET", ApisUrl.loaders);    
      if (data) {        
        data?.map((item:any)=>{
          loaderNames.push(
            {
              label: item,
              value: item
            }
          );
        });
        await AsyncStorage.setItem(asyncStorageLoaders, JSON.stringify(loaderNames));            
      }
    }else{
      const storedLoaders = await AsyncStorage.getItem(asyncStorageLoaders);
      loaderNames = storedLoaders ? JSON.parse(storedLoaders) : [];
    }   
    setLoaders(loaderNames); 
  };

  const resetSubmitData = ()=>{
    setSubmitData({operatorName:'', truckName:'', configurationName:'',pit:'', loader:'',comments:'', dateTime:'', receivedAtUTC:''});
  }

  const onCancel = () => resetSubmitData(); 
  const onSubmit = async () => {
    try{
      const currentDateTime = new Date().toISOString();
      const submitDataWithDateTime = {
        ...submitData,
        dateTime: currentDateTime,
        receivedAtUTC: currentDateTime,
      };
      const lastSubmitData = {...submitData};
      lastSubmitData.comments = "";
      
      await AsyncStorage.setItem(asyncStorageLastSubmitKey, JSON.stringify(lastSubmitData));

      if(isConnected){        
        let response = await submitFormData("POST", ApisUrl.formSubmit, submitDataWithDateTime);
        
        if(response.status === 200){
          Alert.alert(
            "Success",
            "Record has been saved", 
            [
              {
                text: "OK",
                onPress: () => BackHandler.exitApp(),
              },
            ],
            { cancelable: false }
          );

          //resetSubmitData();
        }else{        
          Alert.alert(
            response.status.toString(), 
            response.statusText, 
            [
              {
                text: "OK",
                onPress: () => BackHandler.exitApp(),
              },
            ],
            { cancelable: false }
          );  
        }
      }else{
        const storedData = await AsyncStorage.getItem(asyncStorageKey);
        const storedDataArray = storedData ? JSON.parse(storedData) : [];
        storedDataArray.push(submitDataWithDateTime);

        await AsyncStorage.setItem(asyncStorageKey, JSON.stringify(storedDataArray));        
        Alert.alert(
          "No Internet Connection!",
          "Record has been saved on local storage.",
          [
            {
              text: "OK",   
              onPress: () => BackHandler.exitApp()           
            },
          ],
          { cancelable: false }
        );
      }                  
    }catch(e){      
      Alert.alert("Something went wrong", "Please try again later.");
    }
  }
  //const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const getLastSubmitedData = async ()=>{
    const lastSubmitedData = await AsyncStorage.getItem(asyncStorageLastSubmitKey);    
    if(lastSubmitedData){
      setSubmitData(JSON.parse(lastSubmitedData))
    }
  }

  useEffect(() => {
    if (loaded) {
      getDriverNames();
      getTruckNames();
      getConfigurationNames();
      getPitNames();
      getLoaderNames();      
      
      getLastSubmitedData();
      SplashScreen.hideAsync();      
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>      
      <View style={styles.container}>
      <View style={styles.row}>
        <Text style={{color:isConnected?'green':'red', fontSize:10}}>{isConnected?"Connected to Internet":"No Internet Connection"}</Text>        
        {
          isSubmitting?(
            <Text style={{fontSize:10, color:'gray'}}>
              <ActivityIndicator color='green'/> Submitting local data...
            </Text>        
          ):(
            <Text></Text>
          )
        }          
      </View>      
      <View style={styles.horizontalLine} />
        <View style={styles.row}>
          <View style={styles.dropdownContainer}>            
              <DropdownComponent
                  label="Driver"
                  options={drivers}
                  selectedValue={submitData.operatorName}
                  onValueChange={(value) => handleFormChange('operatorName', value)}
                />
          </View>
          <View style={styles.dropdownContainer}>            
            <DropdownComponent
                  label="Truck"
                  options={trucks}
                  selectedValue={submitData.truckName}
                  onValueChange={(value) => handleFormChange('truckName', value)}
                />
          </View>
          <View style={styles.dropdownContainer}>
          <DropdownComponent
                  label="Configurations"
                  options={configs}
                  selectedValue={submitData.configurationName}
                  onValueChange={(value) => handleFormChange('configurationName', value)}
                />
          </View>
          <View style={styles.dropdownContainer}>
          <DropdownComponent
                  label="Pit"
                  options={pits}
                  selectedValue={submitData.pit}
                  onValueChange={(value) => handleFormChange('pit', value)}
                />
          </View>
          <View style={styles.dropdownContainer}>
          <DropdownComponent
                  label="Loader"
                  options={loaders}
                  selectedValue={submitData.loader}
                  onValueChange={(value) => handleFormChange('loader', value)}
                />
          </View>
        </View>

        <View style={styles.commentsRow}>
          <Text>Comments</Text>
          <TextInput
            style={styles.input}
            value={submitData.comments}
            onChangeText={(value) => handleFormChange('comments', value)}
            placeholder="Enter comments"
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={onSubmit}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>    
  );
}

const styles = StyleSheet.create({
  container: {    
    paddingTop: 50,    
    paddingHorizontal:20,    
    backgroundColor: "#ededed",
    height:'100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dropdownContainer: {
    width: '18%',
  },
  commentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {        
    marginVertical: 8,
    height: 40,
    backgroundColor: "white",        
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },    
    shadowRadius: 1.41,
    elevation: 10,
    padding: 5,
    flex: 1,
    marginLeft: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',    
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    marginRight:10,
    width:100
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    width:100
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  horizontalLine: {    
    marginBottom:15,
    height: 1,
    backgroundColor: '#ccc',  // You can adjust the color
    width: '100%',  // To make it full width
  },
});
