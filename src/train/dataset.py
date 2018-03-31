from os import path

import cv2
import json
import numpy as np
import os


class Dataset(object):
    def __init__(self):
        self.dataset_path = path.realpath(
            path.join(path.dirname(__file__), "..", "..", "results/dataset")
        )
        self.dataset_names = os.listdir(self.dataset_path)
        self.datasets = {}

        for dataset_name in self.dataset_names:
            dataset_class, dataset_type = dataset_name.split('_')

            if dataset_class not in datasets:
                self.datasets[dataset_class] = {}

            self.datasets[dataset_class][dataset_type] = os.listdir(path.join(self.dataset_path, dataset_name))

            if dataset_type == 'y':
                self.datasets[dataset_class][dataset_type] = filter(lambda x: x.endswith('.json'))

    def count_dataset(self, dataset_class="train"):
        return len(self.datasets[dataset_class]['x'])

    def read_dataset(self, dataset_class="train", start=0, count=1000, pad=50):
        dataset = {}

        for (dataset_type, dataset_content) in self.datasets[dataset_class].items():
            dataset[dataset_type] = []
            dataset_name = "%s_%s" % (dataset_class, dataset_type)

            for i in range(start, start + count):
                if i >= len(dataset_content):
                    break

                data_path = path.join(self.dataset_path, dataset_name, dataset_content[i])

                if dataset_type == 'x':
                    dataset[dataset_type].append(
                        np.array(cv2.imread(data_path)).astype('float32') / 255
                    )

                elif dataset_type == 'y':
                    f = open(data_path, 'r')
                    y_data = json.loads(f.read())
                    f.close()

                    if len(y_data) < pad:
                        y_data += [[[1, 0, 0, 0]] * 4] * (pad - len(y_data))

                    dataset[dataset_type].append(y_data)


        return dataset
