// Dynamic TensorFlow loader to prevent build-time loading
let tf: any = null;

export async function getTensorFlow() {
  if (!tf) {
    // Only load TensorFlow when actually needed at runtime
    tf = await import('@tensorflow/tfjs');
  }
  return tf;
}

export async function loadTensorFlow() {
  return getTensorFlow();
}