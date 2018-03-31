import argparse
from dataset import Dataset
from model import LinizeModel
from torch.autograd import Variable
from torch.nn import MSELoss


def run(args):
    seq_size = args.seq_size
    batch_size = args.batch_size
    epoch = args.epoch
    learning_rate = 1e-4

    dataset = Dataset()
    max_dataset = dataset.count_dataset("train")
    train_batch = ceil(max_dataset / batch_size)

    model = LinizeModel()
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
    loss_fn = MSELoss()

    for t in range(epoch):
        for i in train_batch:
            dataset_batch = dataset.read_dataset("train", i * batch_size, batch_size, pad=seq_size)

            x = Variable(dataset_batch['x'])
            y = Variable(dataset_batch['y'])

            y_pred = model(x)

            loss = loss_fn(y_pred, y)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

arg_parser = argparse.ArgumentParser(
    description='A Convolutional LSTM model to train making stroke from rasterized icons or fonts.'
)

arg_parser.add_argument(
    '--batch-size', type=int, metavar='(Batch Size)', help='Batch size of model',
    dest='batch_size', default=128
)

arg_parser.add_argument(
    '--seq-size', type=int, metavar='(Sequence Size)', help='Count of max SVG methods',
    dest='seq_size', default=50
)

arg_parser.add_argument(
    '--epoch', type=int, metavar='(Epoch)', help='Epoch which are used in training',
    dest='epoch', default=30
)

run(arg_parser.parse_args())
