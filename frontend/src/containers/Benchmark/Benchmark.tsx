import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import Button from '@mui/material/Button';
import { BaseLayout, PrivateLayout } from 'src/layouts';
import { postBenchmark } from 'src/api/benchmark';
import styles from './Benchmark.module.scss';
import { PredictionResult } from './models/benchmark.response';
import { toast } from '../../components/Toast';

const modelList = [
  {
    name: 'YoloV8 (nano)',
    key: 'yolov8n',
  },
  {
    name: 'YoloV8 (small)',
    key: 'yolov8s',
  },
  {
    name: 'YoloV8 (medium)',
    key: 'yolov8m',
  },
  {
    name: 'Yolo 11 (nano)',
    key: 'yolo11n',
  },
  {
    name: 'Yolo 11 (small)',
    key: 'yolo11s',
  },
  {
    name: 'Yolo 11 (medium)',
    key: 'yolo11m',
  },
];

export function Benchmark() {
  const [image, setImage] = useState<File | null>(null);
  const [results, setResults] = useState<PredictionResult[]>([]);
  const [_, setIsLoading] = useState<boolean>(false);
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event?.target.files?.[0]) {
      setImage(event.target.files[0]);
      setIsLoading(true);
      await Promise.all(
        modelList.map(async (modelItem) => {
          const formData = new FormData();
          formData.append('image', event?.target.files?.[0]);
          postBenchmark(modelItem.key, formData)
            .then((res) => {
              const resJson: PredictionResult = res.data;
              setResults((prevResults) => [...prevResults, resJson]);
            })
            .catch(() => {
              toast('error', 'Có lỗi xảy ra, vui lòng thử lại sau');
            });
        }),
      );
      setIsLoading(false);
    }
  };

  console.log("results >> ", results)
  const renderUploadArea = () => {
    return (
      <div>
        <Typography variant="h6">Upload ảnh</Typography>
        <label
          htmlFor="uploadFile1"
          className="bg-white text-gray-500 font-semibold text-base rounded max-w-md h-52 flex flex-col items-center justify-center cursor-pointer border-2 border-gray-300 border-dashed mx-auto font-[sans-serif]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-11 mb-2 fill-gray-500"
            viewBox="0 0 32 32"
          >
            <path
              d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z"
              data-original="#000000"
            />
            <path
              d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z"
              data-original="#000000"
            />
          </svg>
          Upload
          <input
            type="file"
            id="uploadFile1"
            className="hidden"
            onChange={handleImageUpload}
            onClick={(e) => {
              e.currentTarget.value = '';
            }}
          />
          <p className="text-xs font-medium text-gray-400 mt-2 px-1">
            PNG, JPG SVG, WEBP, and GIF are Allowed.
          </p>
        </label>
      </div>
    );
  };

  const handleReset = () => {
    setImage(null);
    setResults([]);
  };

  return (
    <BaseLayout>
      <PrivateLayout>
        <Container className={styles['container']} maxWidth="xl">
          <Typography variant="h4" sx={{ mb: 2 }}>
            Benchmark thử nghiệm các mô hình nhận diện
          </Typography>
          <div className="mb-5">
            <Typography variant="body1" sx={{ mb: 2 }}>
              Các mô hình thử nghiệm:
            </Typography>
            {modelList.map((modelItem) => (
              <Chip
                key={modelItem.key}
                label={modelItem.name}
                className="m-1"
              />
            ))}
          </div>
          <Grid container justifyContent="center">
            <Grid xs={6} className="px-2">
              {image ? (
                <div>
                  <div className="mb-2">
                    <img src={URL.createObjectURL(image)} alt="upload" />
                  </div>
                  <Button variant="contained" onClick={() => handleReset()}>
                    Up ảnh khác
                  </Button>
                </div>
              ) : (
                renderUploadArea()
              )}
            </Grid>
          </Grid>
          {image && (
            <Grid container>
              {results.map((result, index) => (
                <Grid xs={4} key={index}>
                  <Card className="mx-2 my-3">
                    <CardContent>
                      <Typography variant="h6">{result.model_type}</Typography>
                      <Typography variant="body1">
                        Total object: {result.output.total}
                      </Typography>
                      <Typography variant="body1">
                        Time: {result.time}s
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </PrivateLayout>
    </BaseLayout>
  );
}
