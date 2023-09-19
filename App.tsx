import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
  useColorScheme,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { DocumentPickerResponse } from 'react-native-document-picker';
import { FFmpegKit, SessionState } from 'ffmpeg-kit-react-native';
import DropDownPicker from "react-native-dropdown-picker";

import { Colors } from 'react-native/Libraries/NewAppScreen';

import { generateFileName } from './lib/string';

import RNFS from "react-native-fs";
import ProgressBar from './components/ProgressBar';
import Video from 'react-native-video';

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const [selectedFile, setSelectedFile] = useState<DocumentPickerResponse>();
  const [fileTypeOpen, setFileTypeOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [fileTypes, setFileTypes] = useState([
    { label: 'MP4', value: 'mp4' },
    { label: 'WEBM', value: 'webm' },
    { label: 'MOV', value: 'mov' },
    { label: 'WMV', value: 'wmv' },
    { label: 'AVI', value: 'avi' },
    { label: 'MKV', value: 'mkv' }
  ]);

  const [conversionInProcess, setConversionInProcess] = useState(false);
  const [newFileName, setNewFileName] = useState<string>("");

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [conversionProgress, setConversionProgress] = useState<number>(0);

  const backgroundStyle: StyleProp<ViewStyle> = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    padding: 10,
    gap: 20,
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  };

  const [videoDuration, setVideoDuration] = useState(0);

  async function selectVideo() {
    try {
      const pickedFile = await DocumentPicker.pickSingle({
        type: DocumentPicker.types.video,
      });
      setSelectedFile(pickedFile);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        throw err;
      }
    }
  }

  async function convert() {
    if (!selectedFile) {
      setErrorMessage("Morate izabrati fajl!");
      return;
    }

    if (!selectedType) {
      setErrorMessage("Morate izabrati tip izlaznog fajla!")
      return;
    }

    setErrorMessage("");

    setConversionInProcess(true);
    const generated_name = generateFileName();

    const fileName = `${generated_name}.${selectedType}`;
    setNewFileName(fileName);

    const temp_file_uri = `${RNFS.TemporaryDirectoryPath}/${selectedFile.name}`;

    await RNFS.copyFile(selectedFile.uri, temp_file_uri);

    const new_file_uri = `${RNFS.PicturesDirectoryPath}/${fileName}`

    const command = `-i "${temp_file_uri}" "${new_file_uri}"`;

    FFmpegKit.executeAsync(command, session => {
      session.getState().then(
        state => {
          if (state === SessionState.COMPLETED) {
            setSuccessMessage(`Konverzija uspesno zavrsena! Fajl je sacuvan kao ${new_file_uri}`);
            setSelectedFile(undefined);
            setConversionProgress(0);
            setConversionInProcess(false);
          } else if (state === SessionState.FAILED) {
            setErrorMessage("Neuspesna konverzija!");
            cancelConversion();
          } else {
            setErrorMessage("Zaustavljena konverzija!");
            cancelConversion();
            setSelectedFile(undefined);
            setConversionProgress(0);
            setConversionInProcess(false);
          }
        }
      );
    }, undefined,
      statistics => {
        const time = statistics.getTime();
        if (time === 0 || videoDuration === 0) {
          setConversionProgress(0);
        } else {
          const percentage = Math.round((time / videoDuration / 10 + Number.EPSILON) * 100) / 100;
          setConversionProgress(percentage);
        }
      })
      .catch(e => setErrorMessage(`${e}`));
  }

  async function cancelConversion() {
    await FFmpegKit.cancel();
    setConversionProgress(0);
    setConversionInProcess(false);
  }

  function onLoadVideoMetadata(data: any) {
    setVideoDuration(data.duration);
  }

  return (
    <SafeAreaView style={backgroundStyle}>
      <Button disabled={conversionInProcess} title="Izaberi video" onPress={selectVideo} />
      {
        selectedFile &&
        <>
          <Text>{`Izabran video: ${selectedFile.name}`}</Text>
          <Text>{`Duzina: ${selectedFile.name}`}</Text>
        </>
      }
      <DropDownPicker
        open={fileTypeOpen}
        value={selectedType}
        items={fileTypes}
        setOpen={setFileTypeOpen}
        setValue={setSelectedType}
        setItems={setFileTypes}
        disabled={conversionInProcess}
      />
      <Button disabled={conversionInProcess || !selectedFile} title="Konvertuj" onPress={convert} />
      {
        newFileName &&
        <Text>
          Fajl sacuvan pod nazivom {newFileName}
        </Text>
      }
      {
        conversionInProcess &&
        <>
          <Button title='Zaustavi trenutnu konverziju' onPress={cancelConversion} />
          <ProgressBar progress={conversionProgress} />
        </>
      }
      <ScrollView style={styles.sectionContainer}>
        {
          successMessage != "" &&
          <Text style={styles.successText}>
            {successMessage}
          </Text>
        }
        {
          errorMessage != "" &&
          <Text style={styles.errorText}>
            {errorMessage}
          </Text>
        }
        {
          selectedFile &&
          <>
            <Text>Video {selectedFile.name}, duzina: {videoDuration}</Text>
            <Video
              muted={true}
              audioOnly={true}
              rate={0}
              source={{ uri: selectedFile.uri }}
              onLoad={onLoadVideoMetadata}
            />
          </>
        }
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  successText: {
    color: "green",
    fontWeight: "700"
  },
  errorText: {
    color: "red",
    fontWeight: '700'
  },
  progressCircle: {
    backgroundColor: "transparent"
  },
  izaberiVideo: {
    paddingVertical: 20
  }
});

export default App;
